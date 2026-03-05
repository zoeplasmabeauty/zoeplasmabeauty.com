/**
 * ARCHIVO: src/app/api/turnos/disponibilidad/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - GET)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como el "Radar de Colisiones" del calendario. Calcula matemáticamente 
 * qué bloques de 30 minutos están libres en un día específico, cruzando el horario 
 * de apertura de la clínica, la duración del tratamiento deseado y los turnos ya existentes.
 * Bloquea la agenda con los estados reales del turno en la BD
 * ('confirmed', 'under_review', etc.) y se integró la lectura de 'customDurationMinutes'
 * para respetar las reprogramaciones de tiempo personalizadas del Administrador.
 * * RESPONSABILIDADES:
 * 1. Reglas de Negocio: Aplica horarios de L a V (10 a 18hs) y Sábados (12 a 18hs).
 * 2. Bloqueos Globales: Deniega el acceso si la fecha está en 'blockedDates'.
 * 3. Extracción: Obtiene los turnos de ese día y sus duraciones desde la BD.
 * 4. Cálculo de Solapamiento: Elimina las horas donde un turno nuevo chocaría con uno viejo.
 * 5. Control de Cierre: Evita que se agende un turno de 60 mins a las 17:30 (cierra a las 18:00).
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db'; 
import { appointments, services, blockedDates } from '../../../../db/schema'; // Importamos la nueva tabla
// Importamos 'inArray' y 'lte', 'gte' para las fechas
import { eq, and, gte, lt, lte, inArray } from 'drizzle-orm';
// Usamos date-fns para manejar la matemática de tiempo de forma segura y precisa
import { addMinutes, parseISO, isBefore, isAfter } from 'date-fns';

export const runtime = 'edge';

// CONFIGURACIÓN DE LA CLÍNICA (Reglas estáticas)
const INTERVALO_MINUTOS = 30; // Bloques de media hora
const HORA_CIERRE = 18;

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

    // ============================================================================
    // 3.5 RADAR DE BLOQUEOS GLOBALES (Vacaciones / Cierres)
    // Buscamos si la fecha solicitada (dateParam) cae dentro de algún rango bloqueado.
    // Lógica: startDate <= dateParam Y endDate >= dateParam
    // ============================================================================
    const bloqueosActivos = await db.select().from(blockedDates).where(
      and(
        lte(blockedDates.startDate, dateParam), // La fecha solicitada es mayor o igual al inicio del bloqueo
        gte(blockedDates.endDate, dateParam)    // La fecha solicitada es menor o igual al fin del bloqueo
      )
    );

    // Si encontramos al menos un registro que cubra esta fecha, cerramos las puertas.
    if (bloqueosActivos.length > 0) {
      // Devolvemos un código HTTP 200 (la petición fue exitosa), pero con una 
      // bandera de estado especial para que el frontend muestre el aviso visual.
      return NextResponse.json({ 
        availableSlots: [], 
        status: "vacations",
        message: bloqueosActivos[0].reason || "La clínica se encuentra cerrada en esta fecha." 
      }, { status: 200 });
    }

    // ============================================================================
    // 4. MATEMÁTICA DE HORARIOS SEGÚN EL DÍA (AHORA ABSOLUTA Y BLINDADA)
    // Al forzar el "-03:00" en el string, obligamos a Cloudflare a respetar 
    // la hora de Buenos Aires sin importar dónde esté el servidor físico.
    // ============================================================================
    const startOfDayUTC = new Date(`${dateParam}T00:00:00.000-03:00`);
    const endOfDayUTC = new Date(`${dateParam}T23:59:59.999-03:00`);

    const diaDeLaSemana = startOfDayUTC.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Regla: Los domingos la consola está apagada
    if (diaDeLaSemana === 0) {
      return NextResponse.json({ availableSlots: [] }, { status: 200 });
    }

    // Definimos a qué hora abrimos el canal (10hs en semana, 12hs los sábados)
    const horaApertura = diaDeLaSemana === 6 ? 12 : 10;

    // 5. EXTRACCIÓN DE LA "PISTA" OCUPADA (Turnos ya guardados)
    // Hacemos un JOIN con services para saber cuánto dura cada turno ya guardado
    const turnosOcupados = await db.select({
      fechaInicio: appointments.appointmentDate,
      duracion: services.durationMinutes,
      // Extraemos la duración personalizada inyectada en la base de datos
      duracionPersonalizada: appointments.customDurationMinutes 
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        // Buscamos colisiones transformando nuestros límites absolutos a formato ISO
        gte(appointments.appointmentDate, startOfDayUTC.toISOString()),
        lt(appointments.appointmentDate, endOfDayUTC.toISOString()),
        // Excluimos SOLO los turnos cancelados o rechazados.
        // Cualquier turno en triage, revisión, falta de pago o confirmado, BLOQUEA la agenda.
        inArray(appointments.status, [
          'awaiting_triage', 
          'under_review', 
          'approved_unpaid', 
          'confirmed', 
          'completed'
        ])
      )
    );

    // Mapeamos los turnos ocupados a objetos de { inicio, fin } para el cálculo de colisiones
    const bloquesOcupados = turnosOcupados.map(turno => {
      const inicio = parseISO(turno.fechaInicio);
      // Si el admin asignó un tiempo distinto (customDuration), tiene prioridad absoluta.
      const fin = addMinutes(inicio, turno.duracionPersonalizada || turno.duracion);
      return { inicio, fin };
    });

    // ============================================================================
    // 6. GENERADOR DE BLOQUES DE TIEMPO (El Secuenciador Absoluto)
    // ============================================================================
    const availableSlots: string[] = [];
    const ahoraRealUTC = new Date(); // Hora real exacta en el servidor en este milisegundo
    
    // Configuramos el límite de cierre como un momento exacto en el tiempo
    const cierreAbsoluto = new Date(`${dateParam}T${HORA_CIERRE.toString().padStart(2, '0')}:00:00.000-03:00`);

    let currentHour = horaApertura;
    let currentMinute = 0;

    // Iteramos manualmente hora por hora y minuto por minuto para evitar funciones mutables
    while (currentHour < HORA_CIERRE) {
      // Creamos el string "HH:mm" visual para el paciente
      const hh = currentHour.toString().padStart(2, '0');
      const mm = currentMinute.toString().padStart(2, '0');
      
      // Creamos el bloque exacto forzando el huso horario argentino (-03:00)
      const slotLocalStr = `${dateParam}T${hh}:${mm}:00.000-03:00`;
      const slotInicioAbsoluto = new Date(slotLocalStr);
      const slotFinAbsoluto = addMinutes(slotInicioAbsoluto, duracionTratamiento);

      // REGLA A: Si el tratamiento termina después de la hora de cierre, detenemos el ciclo.
      if (isAfter(slotFinAbsoluto, cierreAbsoluto)) {
        break; 
      }

      // REGLA B: Si el día elegido es HOY, no podemos mostrar horas que ya pasaron.
      // Comparamos el bloque absoluto contra la hora absoluta actual (con 30 mins de margen)
      if (isBefore(slotInicioAbsoluto, addMinutes(ahoraRealUTC, 30))) {
        // Avanzamos el puntero manual y saltamos este bloque
        currentMinute += INTERVALO_MINUTOS;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute -= 60;
        }
        continue;
      }

      // REGLA C: Radar de Colisiones (Phase Cancellation)
      // Comprobamos si este bloque propuesto se pisa con algún bloque ocupado
      let hayColision = false;
      for (const ocupado of bloquesOcupados) {
        // Un turno colisiona si empieza antes de que termine el otro Y termina después de que el otro empiece
        if (isBefore(slotInicioAbsoluto, ocupado.fin) && isAfter(slotFinAbsoluto, ocupado.inicio)) {
          hayColision = true;
          break;
        }
      }

      // Si la señal está limpia, guardamos la hora en la lista de opciones (ej: "10:30")
      if (!hayColision) {
        availableSlots.push(`${hh}:${mm}`);
      }

      // Avanzamos el puntero 30 minutos para el siguiente ciclo
      currentMinute += INTERVALO_MINUTOS;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }

    // 7. RESPUESTA AL FRONTEND
    return NextResponse.json({ availableSlots, status: "open" }, { status: 200 });

  } catch (error) {
    console.error("🔥 Error en motor de disponibilidad:", error);
    return NextResponse.json({ error: "Error calculando la agenda." }, { status: 500 });
  }
}