/**
 * ARCHIVO: src/app/api/turnos/ficha/route.ts
 * ARQUITECTURA: Controlador Backend (Edge API Route - POST)
 * * * PROPÓSITO ESTRATÉGICO:
 * Recibir, validar y almacenar la Ficha Clínica (Triage) del paciente. 
 * Actúa como la puerta de seguridad médica de la clínica: ningún paciente 
 * pasa a la fase de pago sin que este endpoint registre su estado de salud.
 * * * RESPONSABILIDADES (LO QUE HACE ESTE CÓDIGO):
 * 1. Autenticación de Turno: Verifica que el 'appointmentId' recibido exista y sea válido.
 * 2. Mapeo de Datos: Convierte las respuestas de texto del frontend ("si"/"no") 
 * a booleanos estrictos (true/false) que Drizzle y SQLite puedan entender.
 * 3. Persistencia Relacional Múltiple (3 Pasos):
 * - Actualiza la tabla 'patients' con los nuevos datos personales (domicilio, fecha de nac.).
 * - Inserta un nuevo registro en la tabla 'medical_records' vinculado al turno.
 * - Actualiza el estado del turno en la tabla 'appointments' a 'under_review'.
 * 4. Disparo de Notificaciones: (Preparado para la Fase 3) Avisará al Admin que hay un turno por revisar.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db'; 
import { appointments, patients, medicalRecords } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

// Función auxiliar para convertir los selects del frontend en booleanos puros
const parseYesNo = (value: string | undefined): boolean => value === 'si';

export async function POST(request: Request) {
  try {
    // 1. INICIALIZACIÓN Y CONEXIÓN A D1
    const ctx = getRequestContext();
    const env = ctx.env as unknown as Env;
    
    if (!env || !env.DB) {
      return NextResponse.json({ error: "Servicio de base de datos no disponible." }, { status: 500 });
    }

    const db = createDbConnection(env);

    // 2. EXTRACCIÓN DEL CUERPO DE LA PETICIÓN (Payload)
    // Clonamos por seguridad de infraestructura en Cloudflare Workers
    const clonedRequest = request.clone();
    const body = await clonedRequest.json() as any; // Usamos 'any' aquí temporalmente por la cantidad masiva de campos, pero los mapearemos estrictamente abajo.

    // Extraemos el ID crítico que conecta todo
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: "Falta el identificador del turno." }, { status: 400 });
    }

    // 3. VALIDACIÓN DE SEGURIDAD (Búsqueda del turno padre)
    // Antes de guardar datos médicos, verificamos que el turno exista para sacar el patientId
    const turnosEncontrados = await db.select().from(appointments).where(eq(appointments.id, appointmentId));
    const turnoOriginal = turnosEncontrados[0];

    if (!turnoOriginal) {
      return NextResponse.json({ error: "El turno especificado no existe." }, { status: 404 });
    }

    // 4. OPERACIONES DE BASE DE DATOS (Secuencia Crítica)
    // Drizzle ORM ejecutará estas tres operaciones en la base de datos de Cloudflare D1

    // A. ACTUALIZAR AL PACIENTE (Datos demográficos de la Sección 2)
    await db.update(patients)
      .set({
        dob: body.dob,
        instagram: body.instagram,
        address: body.address,
        howFoundUs: body.howFoundUs
      })
      .where(eq(patients.id, turnoOriginal.patientId));

    // B. CREAR LA FICHA CLÍNICA (Triage Médico completo)
    // Generamos un ID único para la ficha
    const medicalRecordUUID = crypto.randomUUID();

    await db.insert(medicalRecords).values({
      id: medicalRecordUUID,
      appointmentId: appointmentId, // Vínculo inquebrantable con el turno
      
      // Sección 3: Antecedentes (Mapeados a booleanos)
      hasDisease: parseYesNo(body.hasDisease),
      diseaseDetails: body.diseaseDetails || null,
      recentSurgery: body.recentSurgery || null,
      coagulationDisorder: parseYesNo(body.coagulationDisorder),
      takesMedication: parseYesNo(body.takesMedication),
      medicationDetails: body.medicationDetails || null,
      allergies: body.allergies || null,
      
      // Sección 4: Evaluación Cutánea
      skinType: body.skinType,
      usesRetinoids: parseYesNo(body.usesRetinoids),
      retinoidsDetails: body.retinoidsDetails || null,
      usesSunscreen: parseYesNo(body.usesSunscreen),
      
      // Sección 5: Hábitos
      smokes: parseYesNo(body.smokes),
      drinksAlcohol: parseYesNo(body.drinksAlcohol),
      
      // Sección 6: Salud Hormonal
      pregnantNursing: parseYesNo(body.pregnantNursing),
      lastMenstrualCycle: body.lastMenstrualCycle || null,
      contraceptive: body.contraceptive || null,
      
      // Sección 7: Antecedentes Estéticos y Riesgos
      recentAestheticTreatments: parseYesNo(body.recentAestheticTreatments),
      treatmentDetails: body.treatmentDetails || null,
      // Las contraindicaciones vienen como Array (ej: ["Diabetes", "Marcapasos"]). 
      // Las convertimos a un string JSON para guardarlas de forma segura en una sola columna.
      contraindications: JSON.stringify(body.contraindications || []),
      consentGiven: body.consentGiven === true, // Validación estricta del booleano nativo
    });

    // C. AVANZAR LA MÁQUINA DE ESTADOS (Bloqueo de Modificación)
    // Cambiamos el estado del turno para que el paciente no pueda volver a llenar la ficha
    // y para que aparezca en el panel del Administrador.
    await db.update(appointments)
      .set({ status: 'under_review' })
      .where(eq(appointments.id, appointmentId));

    // ============================================================================
    // NOTIFICACIÓN AL ADMINISTRADOR (BREVO API)
    // ============================================================================
    // TODO: En el futuro, aquí inyectaremos la lógica para disparar un correo a 
    // contacto@zoeplasmabeauty.com diciendo "El turno X está esperando tu revisión".
    // ============================================================================

    // 5. RESPUESTA AL FRONTEND
    // Le confirmamos al componente TriageForm que todo se guardó perfectamente
    return NextResponse.json({ 
      success: true, 
      message: "Ficha clínica guardada y turno en revisión." 
    }, { status: 201 });

  } catch (error: any) {
    // 6. MANEJO DE CRISIS
    console.error("🔥 Error crítico guardando Ficha Clínica:", error.message);
    
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la ficha." }, 
      { status: 500 }
    );
  }
}