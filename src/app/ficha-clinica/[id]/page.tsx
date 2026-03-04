/**
 * ARCHIVO: src/app/ficha-clinica/[id]/page.tsx
 * ARQUITECTURA: Server Component (Next.js App Router)
 * * PROPÓSITO ESTRATÉGICO:
 * Proteger la ruta dinámica del Paso 2. Extrae el ID del turno de la URL, 
 * consulta la base de datos de forma segura en el servidor y alimenta 
 * el formulario interactivo del cliente.
 * * RESPONSABILIDADES:
 * 1. Validación de Ruta: Si el ID no existe o el turno ya fue completado, bloquea el acceso.
 * 2. Extracción de Datos: Ejecuta un JOIN en D1 para traer Turno + Paciente + Servicio.
 * 3. Inyección de Propiedades: Pasa los datos extraídos al componente visual (TriageForm).
 */

import { getRequestContext } from '@cloudflare/next-on-pages';
import { createDbConnection, Env } from '../../../db';
import { appointments, patients, services } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
// Importaremos el componente cliente que es el form para la ficha clinica
import TriageForm from '../../../components/TriageForm';

export const runtime = 'edge';

// Next.js pasa automáticamente los parámetros de la URL (ej: [id]) a los Server Components
export default async function FichaClinicaPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 1. CONEXIÓN SEGURA A D1 (Desde el Servidor)
  const ctx = getRequestContext();
  const env = ctx.env as unknown as Env;
  
  if (!env || !env.DB) {
    return <div className="p-10 text-center text-red-600">Error: Base de datos no disponible.</div>;
  }

  const db = createDbConnection(env);

  // 2. EXTRACCIÓN Y CRUCE DE DATOS (JOIN)
  // Buscamos el turno específico y cruzamos su información con las tablas de Paciente y Servicio
  const turnosResult = await db.select({
    appointmentId: appointments.id,
    appointmentDate: appointments.appointmentDate,
    status: appointments.status,
    serviceName: services.name,
    patientId: patients.id, // Requerido para actualizar el paciente
    fullName: patients.fullName,
    dni: patients.dni,
    phone: patients.phone,
    email: patients.email
  })
  .from(appointments)
  .innerJoin(patients, eq(appointments.patientId, patients.id))
  .innerJoin(services, eq(appointments.serviceId, services.id))
  .where(eq(appointments.id, id));

  // Como buscamos por ID único, tomamos el primer resultado
  const turnoData = turnosResult[0];

  // 3. REGLAS DE SEGURIDAD Y REDIRECCIÓN
  if (!turnoData) {
    // Si alguien inventa una URL, lo mandamos al inicio
    redirect('/'); 
  }

  // Si el turno ya pasó por esta fase (ya no es awaiting_triage), evitamos que llenen la ficha dos veces
  if (turnoData.status !== 'awaiting_triage') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border border-gray-100">
          <h2 className="mb-4 text-2xl font-bold text-stone-800">Ficha ya enviada</h2>
          <p className="text-stone-600">
            Este turno ya tiene una ficha clínica asociada o se encuentra en revisión. 
            Te contactaremos por correo electrónico pronto.
          </p>
        </div>
      </div>
    );
  }

  // 4. RENDERIZADO DEL CLIENTE
  // Le pasamos los datos pre-cargados al componente interactivo, incluyendo patientId
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <TriageForm initialData={turnoData} />
    </main>
  );
}