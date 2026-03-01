/**
 * ARCHIVO: src/app/api/turnos/disponibilidad/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el "Radar de Colisiones" del calendario. Calcula matemáticamente 
 * qué bloques de 30 minutos están libres en un día específico, cruzando el horario 
 * de apertura de la clínica, la duración del tratamiento deseado y los turnos ya existentes.
 * * RESPONSABILIDADES:
 * 1. Reglas de Negocio: Aplica horarios de L a V (10 a 19hs) y Sábados (12 a 19hs).
 * 2. Extracción: Obtiene los turnos de ese día y sus duraciones desde la BD.
 * 3. Cálculo de Solapamiento: Elimina las horas donde un turno nuevo chocaría con uno viejo.
 * 4. Control de Cierre: Evita que se agende un turno de 60 mins a las 18:30 (cierra a las 19:00).
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db'; 
import { appointments, services } from '../../../../db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
// Usamos date-fns para manejar la matemática de tiempo de forma segura y precisa
import { addMinutes, parseISO, isBefore, isAfter, setHours, setMinutes, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const runtime = 'edge';

// CONFIGURACIÓN DE LA CLÍNICA (Reglas estáticas)
const TIMEZONE = 'America/Argentina/Buenos_Aires';
const INTERVALO_MINUTOS = 30; // Bloques de media hora
const HORA_CIERRE = 19; 

export async function GET(request: Request) {
  try {
    // 1. LECTURA DE PARÁMETROS DE LA URL (?date=2026-03-15&serviceId=srv_1)
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date'); // Formato esperado: YYYY-MM-DD
    const serviceId = searchParams.get('serviceId');

    if (!dateParam || !serviceId) {
      return NextResponse.json({ error: "Faltan parámetros de fecha o servicio." }, { status: 400 });
    }

    // 2. CONEXIÓN A LA BASE DE DATOS
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    if (!env || !env.DB) throw new Error("Base de datos no disponible.");
    const db = createDbConnection(env);

    // 3. EXTRACCIÓN DEL SERVICIO (Para saber cuánto dura el "clip" de audio)
    const [selectedService] = await db.select().from(services).where(eq(services.id, serviceId));
    
    if (!selectedService) {
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }
    const duracionTratamiento = selectedService.durationMinutes;

    // 4. MATEMÁTICA DE HORARIOS SEGÚN EL DÍA
    // Convertimos el string 'YYYY-MM-DD' a un objeto Date en la zona horaria de Buenos Aires
    const fechaSolicitada = toZonedTime(`${dateParam}T00:00:00`, TIMEZONE);
    const diaDeLaSemana = fechaSolicitada.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Regla: Los domingos la consola está apagada
    if (diaDeLaSemana === 0) {
      return NextResponse.json({ availableSlots: [] }, { status: 200 });
    }

    // Definimos a qué hora abrimos el canal (10hs en semana, 12hs los sábados)
    const horaApertura = diaDeLaSemana === 6 ? 12 : 10;

    // Construimos los límites absolutos del día (00:00:00 a 23:59:59) en UTC 
    // para buscar correctamente en la base de datos sin errores de zona horaria.
    const startOfDayUTC = new Date(`${dateParam}T00:00:00.000-03:00`).toISOString();
    const endOfDayUTC = new Date(`${dateParam}T23:59:59.999-03:00`).toISOString();

    // 5. EXTRACCIÓN DE LA "PISTA" OCUPADA (Turnos ya guardados)
    // Hacemos un JOIN con services para saber cuánto dura cada turno ya guardado
    const turnosOcupados = await db.select({
      fechaInicio: appointments.appointmentDate,
      duracion: services.durationMinutes
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        gte(appointments.appointmentDate, startOfDayUTC),
        lt(appointments.appointmentDate, endOfDayUTC),
        // IMPORTANTE: Excluimos los turnos cancelados, esos liberan espacio.
        // Aquí asumiremos que "pending" y "confirmed" bloquean la agenda.
        eq(appointments.status, 'pending') // Si tuvieras 'confirmed', deberías usar un operador 'inArray'
      )
    );

    // Mapeamos los turnos ocupados a objetos de { inicio, fin } para el cálculo de colisiones
    const bloquesOcupados = turnosOcupados.map(turno => {
      const inicio = parseISO(turno.fechaInicio);
      const fin = addMinutes(inicio, turno.duracion);
      return { inicio, fin };
    });

    // 6. GENERADOR DE BLOQUES DE TIEMPO (El Secuenciador)
    const availableSlots: string[] = [];
    const ahora = toZonedTime(new Date(), TIMEZONE); // Hora actual real en Buenos Aires
    
    // Configuramos el puntero de tiempo en la hora de apertura
    let slotActual = setMinutes(setHours(fechaSolicitada, horaApertura), 0);
    const limiteCierre = setMinutes(setHours(fechaSolicitada, HORA_CIERRE), 0);

    // Iteramos cada 30 minutos hasta llegar al final del día
    while (isBefore(slotActual, limiteCierre)) {
      const slotFin = addMinutes(slotActual, duracionTratamiento);

      // REGLA A: Si el tratamiento termina después de la hora de cierre, no se puede agendar.
      if (isAfter(slotFin, limiteCierre)) {
        break; 
      }

      // REGLA B: Si el día elegido es HOY, no podemos mostrar horas que ya pasaron.
      // Le damos un margen de seguridad (ej. no agendar algo para dentro de 5 minutos, sino con anticipación)
      if (dateParam === format(ahora, 'yyyy-MM-dd') && isBefore(slotActual, addMinutes(ahora, 30))) {
        slotActual = addMinutes(slotActual, INTERVALO_MINUTOS);
        continue;
      }

      // REGLA C: Radar de Colisiones (Phase Cancellation)
      // Comprobamos si este bloque propuesto se pisa con algún bloque ocupado
      let hayColision = false;
      for (const ocupado of bloquesOcupados) {
        // Un turno colisiona si empieza antes de que termine el otro Y termina después de que el otro empiece
        if (isBefore(slotActual, ocupado.fin) && isAfter(slotFin, ocupado.inicio)) {
          hayColision = true;
          break;
        }
      }

      // Si la señal está limpia, guardamos la hora en la lista de opciones (ej: "10:30")
      if (!hayColision) {
        availableSlots.push(format(slotActual, 'HH:mm'));
      }

      // Avanzamos el puntero 30 minutos para el siguiente ciclo
      slotActual = addMinutes(slotActual, INTERVALO_MINUTOS);
    }

    // 7. RESPUESTA AL FRONTEND
    return NextResponse.json({ availableSlots }, { status: 200 });

  } catch (error) {
    console.error("🔥 Error en motor de disponibilidad:", error);
    return NextResponse.json({ error: "Error calculando la agenda." }, { status: 500 });
  }
}