/**
 * ARCHIVO: src/lib/emailTemplates.ts
 * ARQUITECTURA: Módulo Auxiliar (Librería de utilidades)
 * * PROPÓSITO ESTRATÉGICO:
 * Aislar la capa de presentación (HTML) de la lógica de negocio (API).
 * Permite a los diseñadores o administradores modificar la estética del correo
 * sin tocar ni poner en riesgo la base de datos o las reglas de seguridad.
 * Se añade la plantilla de alerta médica (Triage) para el administrador.
 * Diseño unificado "Clinical-light" para mantener 
 * consistencia absoluta de marca en todas las comunicaciones.
 */

// ============================================================================
// COMPONENTES REUTILIZABLES (Variables CSS en línea para consistencia)
// ============================================================================
const THEME = {
  primary: '#425482', // Azul corporativo (Zoe Blue)
  primaryLight: '#568dcd', // Azul claro para botones
  textDark: '#1c1c1c', // Texto principal oscuro
  textMuted: '#555555', // Texto secundario
  bgPage: '#f8f9fa', // Fondo exterior de la página
  bgCard: '#ffffff', // Fondo interior de la tarjeta
  border: '#eaeaea', // Bordes sutiles
};

const HEADER_HTML = `
  <div style="background-color: ${THEME.primary}; padding: 30px 20px; text-align: center;">
    <h1 style="color: #ffffff; font-weight: 300; margin: 0; font-size: 24px; letter-spacing: 1px;">
      Zoe Plasma <span style="font-weight: 700;">Beauty</span>
    </h1>
  </div>
`;

const FOOTER_HTML = `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid ${THEME.border};">
    <p style="font-size: 13px; color: #888888; margin: 0; text-align: center;">
      Centro de Estética Avanzada<br>
      <strong style="color: ${THEME.primary}; font-size: 14px; display: inline-block; margin-top: 5px;">El equipo de Zoe Plasma Beauty</strong>
    </p>
  </div>
`;

// ============================================================================
// 1. PLANTILLA: CONFIRMACIÓN DE TURNO PAGADO (Fase 4 - Webhook)
// ============================================================================
interface BookingEmailProps {
  fullName: string;
  serviceId: string;
  fechaFormateada: string;
  phone: string;
}

export const getBookingConfirmationEmail = ({
  fullName,
  serviceId,
  fechaFormateada,
  phone
}: BookingEmailProps): string => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark};">
      <div style="max-width: 550px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 20px; margin-top: 0;">¡Hola, <strong>${fullName}</strong>!</h2>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Tu pago ha sido procesado y tu turno ha sido <strong>confirmado exitosamente</strong>.
          </p>
          
          <div style="background-color: #f4f7fb; border-left: 4px solid #34d399; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #777777; text-transform: uppercase; letter-spacing: 1px;">Tratamiento Reservado</p>
            <p style="margin: 0 0 20px 0; font-weight: bold; font-size: 16px; color: ${THEME.textDark};">${serviceId}</p>
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #777777; text-transform: uppercase; letter-spacing: 1px;">Fecha y Hora (Local)</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px; color: ${THEME.textDark}; text-transform: capitalize;">${fechaFormateada}</p>
          </div>
          
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Nos pondremos en contacto contigo vía WhatsApp al número <strong>${phone}</strong> si necesitamos enviarte indicaciones previas a tu tratamiento.
          </p>
          
          ${FOOTER_HTML}
        </div>
      </div>
    </div>
  `;
};

// ============================================================================
// 2. PLANTILLA: ALERTA DE TRIAGE MÉDICO (Para el Administrador)
// ============================================================================
interface AdminTriageAlertProps {
  patientName: string;
  appointmentId: string;
  baseUrl: string; 
}

export const getAdminTriageAlertEmail = ({
  patientName,
  appointmentId,
  baseUrl
}: AdminTriageAlertProps): string => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark};">
      <div style="max-width: 550px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 22px; margin-top: 0;">🚨 Triage Pendiente</h2>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 16px;">
            El paciente <strong>${patientName}</strong> acaba de completar su Ficha Clínica y Anamnesis.
          </p>
          
          <div style="background-color: #fff9e6; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
            <p style="margin: 0; color: #b45309; font-size: 14px; font-weight: 500;">
              El turno se encuentra bloqueado en estado <strong>'En Revisión'</strong> hasta que evalúes su perfil médico.
            </p>
          </div>
          
          <div style="margin: 40px 0;">
            <a href="${baseUrl}/admin/dashboard/revisar/${appointmentId}" 
               style="background-color: ${THEME.primaryLight}; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(86, 141, 205, 0.2);">
              Revisar Ficha Médica
            </a>
          </div>
          
          <p style="font-size: 12px; color: #999999; margin-top: 30px; border-top: 1px solid ${THEME.border}; padding-top: 20px;">
            Este es un mensaje automático del sistema de reservas de Zoe Plasma Beauty. No respondas a este correo.
          </p>
        </div>
      </div>
    </div>
  `;
};

// ============================================================================
// 3. PLANTILLA: APROBACIÓN DE TRIAGE Y LINK DE PAGO (Fase 3 - Paciente)
// ============================================================================
// CONTRATO ESTRICTO: Se añadieron los campos financieros necesarios para el desglose
interface ApprovalEmailProps {
  patientName: string;
  serviceName: string;
  precioTratamiento: string; // Nuevo: Precio total del tratamiento
  valorSena: string; // Nuevo: Valor base de la seña (50.000)
  cobroServicio: string; // Nuevo: 8.25% de la seña
  totalAPagarMP: string; // Nuevo: Seña + 8.25%
  saldoRestante: string; // Nuevo: Precio Tratamiento - Seña
  checkoutUrl: string;
}

export const getApprovalEmail = ({
  patientName,
  serviceName,
  precioTratamiento,
  valorSena,
  cobroServicio,
  totalAPagarMP,
  saldoRestante,
  checkoutUrl
}: ApprovalEmailProps): string => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark};">
      <div style="max-width: 550px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 20px; margin-top: 0;">Hola, <strong>${patientName}</strong></h2>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Nuestro equipo médico ha revisado tu Ficha Clínica y nos alegra confirmarte que <strong>eres apto/a</strong> para el tratamiento de <strong>${serviceName}</strong>.
          </p>
          
          <div style="background-color: #f4f7fb; border-left: 4px solid ${THEME.primaryLight}; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
            <p style="margin: 0 0 15px 0; font-size: 12px; color: #777777; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #dce4ef; padding-bottom: 5px;">Detalle de Reserva</p>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: ${THEME.textMuted};">Valor del Tratamiento:</span>
              <strong style="color: ${THEME.textDark};">$${precioTratamiento}</strong>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
              <span style="color: ${THEME.textMuted};">Seña (Abono previo):</span>
              <strong style="color: ${THEME.textDark};">$${valorSena}</strong>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
              <span style="color: ${THEME.textMuted};">Cargos por servicio (Mercado Pago):</span>
              <strong style="color: ${THEME.textDark};">$${cobroServicio}</strong>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #dce4ef;">
              <span style="font-weight: 600; color: ${THEME.textDark}; font-size: 16px;">Total a pagar ahora:</span>
              <strong style="color: ${THEME.primary}; font-size: 18px;">$${totalAPagarMP}</strong>
            </div>
          </div>
          
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              El día de tu turno deberás abonar en la clínica el saldo restante de:<br>
              <strong style="font-size: 18px; display: block; margin-top: 5px;">$${saldoRestante}</strong>
            </p>
          </div>
          
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px; text-align: center;">
            Para confirmar tu turno de manera oficial y bloquear tu espacio en la agenda, por favor abona la seña.
          </p>
          
          <div style="margin: 35px 0; text-align: center;">
            <a href="${checkoutUrl}" 
               style="background-color: ${THEME.primaryLight}; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(86, 141, 205, 0.2);">
              Pagar Seña y Confirmar Turno
            </a>
          </div>
          
          <div style="background-color: #fff9e6; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="margin: 0; color: #b45309; font-size: 13px; font-weight: 500;">
              <strong>Aviso importante:</strong> Si no realizas el pago en las próximas horas, el sistema podría liberar tu espacio automáticamente.
            </p>
          </div>
          
          ${FOOTER_HTML}
        </div>
      </div>
    </div>
  `;
};

// ============================================================================
// 4. PLANTILLA: RECHAZO MÉDICO DE TRIAGE (Fase 3 - Paciente)
// ============================================================================
interface RejectionEmailProps {
  patientName: string;
  serviceName: string;
}

export const getRejectionEmail = ({
  patientName,
  serviceName
}: RejectionEmailProps): string => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark};">
      <div style="max-width: 550px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 20px; margin-top: 0;">Hola, <strong>${patientName}</strong></h2>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Nuestro equipo médico ha evaluado cuidadosamente tu Ficha Clínica.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="margin: 0; color: #b91c1c; font-size: 15px; line-height: 1.6;">
              Priorizando siempre tu salud y seguridad, hemos determinado que en este momento <strong>no es seguro proceder con el tratamiento de ${serviceName}</strong> debido a las condiciones de salud o contraindicaciones indicadas en tu formulario.
            </p>
          </div>
          
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Tu turno ha sido cancelado y no se ha realizado ningún cargo ni reserva.
          </p>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Si consideras que hubo un error al llenar la ficha o deseas consultar cuándo podrías ser apto/a, por favor responde a este correo o escríbenos a nuestro WhatsApp oficial.
          </p>
          
          ${FOOTER_HTML}
        </div>
      </div>
    </div>
  `;
};