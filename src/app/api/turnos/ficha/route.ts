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
 * 4. Disparo de Notificaciones: Avisa inmediatamente al Admin por correo que hay un turno por revisar.
 */

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../db'; 
import { appointments, patients, medicalRecords } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// Importamos la función constructora del correo desde nuestra librería centralizada
import { getAdminTriageAlertEmail } from '../../../../lib/emailTemplates';

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
    // Dispara un correo a contacto@zoeplasmabeauty.com avisando que hay un triage pendiente
    try {
      const cloudflareEnv = env as unknown as Record<string, string>;
      const brevoApiKey = cloudflareEnv.BREVO_API_KEY || process.env.BREVO_API_KEY;
      
      if (brevoApiKey) {
        // Obtenemos el nombre del paciente para personalizar el asunto del correo
        const patientData = await db.select({ fullName: patients.fullName }).from(patients).where(eq(patients.id, turnoOriginal.patientId));
        const patientName = patientData[0]?.fullName || "Un paciente";

        // Determinamos la URL base dinámica para el botón del correo
        const baseUrl = process.env.NODE_ENV === 'production' ? 'https://zoeplasmabeauty.com' : 'http://localhost:3000';

        // Llamamos a la librería para ensamblar el HTML
        const emailHtml = getAdminTriageAlertEmail({
          patientName,
          appointmentId,
          baseUrl
        });

        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            sender: { name: "Sistema Zoe Plasma Beauty", email: "no-reply@zoeplasmabeauty.com" },
            to: [{ email: "contacto@zoeplasmabeauty.com", name: "Administrador Zoe Plasma Beauty" }],
            subject: `🚨 Triage Pendiente: Revisar ficha de ${patientName}`,
            htmlContent: emailHtml // Inyectamos el HTML generado por la librería
          })
        });
        console.log(`📨 [API FICHA] Alerta enviada al administrador sobre la ficha de ${patientName}.`);
      } else {
        console.warn("⚠️ [API FICHA] BREVO_API_KEY no configurada. No se envió alerta al admin.");
      }
    } catch (emailError) {
      console.error("🔴 [API FICHA] Fallo no crítico enviando alerta al admin:", emailError);
      // No lanzamos throw aquí para asegurar que el frontend reciba el success: true
    }
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