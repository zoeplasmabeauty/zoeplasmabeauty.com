/**
 * ARCHIVO: src/app/admin/dashboard/revisar/[id]/page.tsx
 * ARQUITECTURA: Server Component (Next.js App Router)
 * * PROPÓSITO ESTRATÉGICO:
 * Extraer de forma segura y unificada toda la información clínica y personal 
 * de un paciente específico para el proceso de Triage (Aprobación/Rechazo).
 * * RESPONSABILIDADES:
 * 1. Validación Paramétrica: Asegurar que el ID del turno solicitado exista.
 * 2. Extracción Multi-Tabla (JOIN): Unir Turnos, Pacientes, Servicios y Fichas Clínicas en una sola consulta.
 * 3. Inyección Segura: Pasar estos datos formateados al componente cliente interactivo 
 * (ReviewTriageClient) sin exponer la lógica de la base de datos al navegador.
 */

import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../../../db';
import { appointments, patients, services, medicalRecords } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
// Importaremos el componente visual interactivo que crearemos en el próximo paso
import ReviewTriageClient from '../../../../../components/admin/ReviewTriageClient';

export const runtime = 'edge';

export default async function RevisarFichaPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 1. CONEXIÓN SEGURA A D1 (Desde el Servidor)
  const ctx = getRequestContext();
  const env = ctx.env as unknown as Env;
  
  if (!env || !env.DB) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="p-8 bg-white rounded-2xl shadow-sm text-red-600 font-medium">
          Error Crítico: Base de datos no disponible.
        </div>
      </div>
    );
  }

  const db = createDbConnection(env);

  // 2. LA EXTRACCIÓN MAESTRA (MEGA JOIN)
  // Cruzamos 4 tablas simultáneamente para construir el expediente completo del paciente.
  const expedienteResult = await db.select({
    // A. Datos del Turno y Servicio
    appointmentId: appointments.id,
    appointmentDate: appointments.appointmentDate,
    status: appointments.status,
    serviceName: services.name,
    servicePrice: services.price,
    
    // B. Datos Personales (Contacto y Demografía)
    patientName: patients.fullName,
    patientDni: patients.dni,
    patientPhone: patients.phone,
    patientEmail: patients.email,
    patientDob: patients.dob,
    patientAddress: patients.address,
    patientInstagram: patients.instagram,
    patientHowFoundUs: patients.howFoundUs,
    
    // C. Ficha Médica (Triage) - Sección 3 a 7
    hasDisease: medicalRecords.hasDisease,
    diseaseDetails: medicalRecords.diseaseDetails,
    recentSurgery: medicalRecords.recentSurgery,
    coagulationDisorder: medicalRecords.coagulationDisorder,
    takesMedication: medicalRecords.takesMedication,
    medicationDetails: medicalRecords.medicationDetails,
    allergies: medicalRecords.allergies,
    skinType: medicalRecords.skinType,
    usesRetinoids: medicalRecords.usesRetinoids,
    retinoidsDetails: medicalRecords.retinoidsDetails,
    usesSunscreen: medicalRecords.usesSunscreen,
    smokes: medicalRecords.smokes,
    drinksAlcohol: medicalRecords.drinksAlcohol,
    pregnantNursing: medicalRecords.pregnantNursing,
    lastMenstrualCycle: medicalRecords.lastMenstrualCycle,
    contraceptive: medicalRecords.contraceptive,
    recentAestheticTreatments: medicalRecords.recentAestheticTreatments,
    treatmentDetails: medicalRecords.treatmentDetails,
    contraindications: medicalRecords.contraindications,
    consentGiven: medicalRecords.consentGiven,
  })
  .from(appointments)
  .innerJoin(patients, eq(appointments.patientId, patients.id))
  .innerJoin(services, eq(appointments.serviceId, services.id))
  // Utilizamos innerJoin asumiendo que si el turno está 'under_review', la ficha existe obligatoriamente
  .innerJoin(medicalRecords, eq(appointments.id, medicalRecords.appointmentId))
  .where(eq(appointments.id, id));

  const expediente = expedienteResult[0];

  // 3. AUDITORÍA DE EXISTENCIA
  // Si alguien ingresa un ID falso o un turno que no tiene ficha, lo pateamos al panel.
  if (!expediente) {
    redirect('/admin/dashboard');
  }

  // 4. RENDERIZADO DEL CLIENTE
  // Le entregamos el expediente completo al componente interactivo para que lo dibuje
  return (
    <div className="w-full">
      <ReviewTriageClient expediente={expediente} />
    </div>
  );
}