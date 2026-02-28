/**
 * ARCHIVO: src/lib/emailTemplates.ts
 * ARQUITECTURA: Módulo Auxiliar (Librería de utilidades)
 * * PROPÓSITO ESTRATÉGICO:
 * Aislar la capa de presentación (HTML) de la lógica de negocio (API).
 * Permite a los diseñadores o administradores modificar la estética del correo
 * sin tocar ni poner en riesgo la base de datos o las reglas de seguridad.
 */

// CONTRATO ESTRICTO: Definimos exactamente qué datos necesita la plantilla para funcionar
interface BookingEmailProps {
  fullName: string;
  serviceId: string;
  fechaFormateada: string;
  phone: string;
}

// FUNCIÓN EXPORTABLE: Recibe los datos dinámicos y devuelve el HTML ensamblado
export const getBookingConfirmationEmail = ({
  fullName,
  serviceId,
  fechaFormateada,
  phone
}: BookingEmailProps): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; color: #333;">
      <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #444; font-weight: 300; margin: 0;">Zoe Plasma <span style="font-weight: 600;">Beauty</span></h1>
      </div>
      
      <h2 style="color: #444; font-weight: 300;">¡Hola, <strong>${fullName}</strong>!</h2>
      <p style="line-height: 1.5;">Hemos recibido tu solicitud de evaluación exitosamente.</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #444; padding: 15px; border-radius: 4px; margin: 25px 0;">
        <p style="margin: 0 0 5px 0; font-size: 13px; color: #666; text-transform: uppercase;">Tratamiento Seleccionado</p>
        <p style="margin: 0 0 15px 0; font-weight: bold; font-size: 16px;">${serviceId}</p>
        
        <p style="margin: 0 0 5px 0; font-size: 13px; color: #666; text-transform: uppercase;">Fecha y Hora (Local)</p>
        <p style="margin: 0; font-weight: bold; font-size: 16px; text-transform: capitalize;">${fechaFormateada}</p>
      </div>

      <p style="line-height: 1.5;">Pronto nos pondremos en contacto contigo vía WhatsApp al número <strong>${phone}</strong> para confirmar los detalles finales y brindarte las indicaciones previas a tu cita.</p>
      <br>
      <p style="font-size: 13px; color: #888;">Atentamente,<br><strong>El equipo de Zoe Plasma Beauty</strong></p>
    </div>
  `;
};