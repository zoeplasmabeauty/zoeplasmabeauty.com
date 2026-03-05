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
 * Se añadieron las plantillas para notificar Reprogramaciones y 
 * Cancelaciones manuales con notas personalizadas.
 * La plantilla de Rechazo de Triage (getRejectionEmail) incluye
 * el motivo médico redactado por el administrador y un botón de contacto directo a WhatsApp.
 * Contien el Dossier de Cuidados Previos (Fibroblast) directamente dentro de la
 * plantilla de Confirmación de Turno.
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
// 1. PLANTILLA: CONFIRMACIÓN DE TURNO PAGADO Y CUIDADOS PREVIOS (Fase 4 - Webhook)
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
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark}; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 20px; margin-top: 0;">¡Hola, <strong>${fullName}</strong>!</h2>
          <p style="color: ${THEME.textMuted}; font-size: 15px;">
            Tu pago ha sido procesado y tu turno ha sido <strong>confirmado exitosamente</strong>.
          </p>
          
          <div style="background-color: #f4f7fb; border-left: 4px solid #34d399; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #777777; text-transform: uppercase; letter-spacing: 1px;">Tratamiento Reservado</p>
            <p style="margin: 0 0 20px 0; font-weight: bold; font-size: 16px; color: ${THEME.textDark};">${serviceId}</p>
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #777777; text-transform: uppercase; letter-spacing: 1px;">Fecha y Hora (Local)</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px; color: ${THEME.textDark}; text-transform: capitalize;">${fechaFormateada}</p>
          </div>
          
          <div style="margin-top: 40px; padding-top: 30px; border-top: 2px dashed ${THEME.border};">
            <h3 style="color: ${THEME.primary}; font-size: 18px; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">📋 Cuidados Previos Obligatorios</h3>
            <p style="font-size: 14px; color: ${THEME.textMuted}; margin-bottom: 25px;">
              Para garantizar tu seguridad y obtener los mejores resultados con el tratamiento, es <strong>fundamental</strong> que sigas estas indicaciones al pie de la letra antes del procedimiento:
            </p>

            <h4 style="font-size: 15px; color: ${THEME.textDark}; margin-bottom: 10px;">✅ 7–10 días antes:</h4>
            <ul style="font-size: 14px; color: ${THEME.textMuted}; margin-top: 0; padding-left: 20px; margin-bottom: 20px;">
              <li>Evitar exposición solar directa y bronceado.</li>
              <li>No utilizar camas solares.</li>
              <li>Suspender el uso de productos sensibilizantes: <strong>Retinoides</strong> y <strong>Ácidos</strong> (glicólico, salicílico, mandélico, retinol, etc.).</li>
              <li>Suspender exfoliantes físicos o químicos.</li>
              <li>No realizar peelings ni tratamientos agresivos en la zona.</li>
            </ul>

            <h4 style="font-size: 15px; color: ${THEME.textDark}; margin-bottom: 10px;">✅ 72 horas antes:</h4>
            <ul style="font-size: 14px; color: ${THEME.textMuted}; margin-top: 0; padding-left: 20px; margin-bottom: 20px;">
              <li>Evitar consumo excesivo de alcohol.</li>
              <li>No depilar, rasurar ni irritar la zona a tratar.</li>
              <li>Mantener la piel hidratada.</li>
            </ul>

            <h4 style="font-size: 15px; color: ${THEME.textDark}; margin-bottom: 10px;">✅ 24 horas antes:</h4>
            <ul style="font-size: 14px; color: ${THEME.textMuted}; margin-top: 0; padding-left: 20px; margin-bottom: 20px;">
              <li>No aplicar cremas irritantes ni activos fuertes.</li>
              <li>Evitar maquillaje intenso en la zona.</li>
              <li>Dormir bien y mantenerse hidratada/o.</li>
            </ul>

            <h4 style="font-size: 15px; color: ${THEME.textDark}; margin-bottom: 10px;">✅ El día del tratamiento:</h4>
            <ul style="font-size: 14px; color: ${THEME.textMuted}; margin-top: 0; padding-left: 20px; margin-bottom: 25px;">
              <li>Asistir con la piel limpia y sin maquillaje.</li>
              <li><strong>No aplicar cremas, aceites ni protector solar</strong> en la zona a tratar.</li>
              <li>Traer gorra o lentes de sol si el tratamiento es facial.</li>
              <li>Informar inmediatamente cualquier cambio en tu estado de salud.</li>
            </ul>

            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
              <h4 style="color: #b91c1c; font-size: 14px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase;">⚠️ Importante: Motivos de Reprogramación</h4>
              <p style="font-size: 13px; color: #991b1b; margin-top: 0; margin-bottom: 10px;">Por estrictos protocolos médicos, el tratamiento deberá reprogramarse obligatoriamente si el día del turno presentas:</p>
              <ul style="font-size: 13px; color: #991b1b; margin: 0; padding-left: 20px;">
                <li>Herpes activo.</li>
                <li>Fiebre o cuadro viral.</li>
                <li>Irritación o lesión en la piel a tratar.</li>
                <li>Embarazo confirmado.</li>
                <li>Piel recientemente bronceada.</li>
              </ul>
            </div>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="color: #15803d; font-size: 13px; margin: 0;">
                <strong>💡 Recomendación profesional:</strong><br>
                Te sugerimos traer los productos de cuidado facial que usas habitualmente para evaluar si son aptos para su uso posterior al tratamiento.
              </p>
            </div>
            
          </div>
          <p style="color: ${THEME.textMuted}; font-size: 14px; margin-top: 30px; text-align: center; font-style: italic;">
            Seguir estas indicaciones permite una mejor recuperación y optimiza los resultados. Si tienes alguna duda, consúltanos vía WhatsApp al <a href="https://wa.me/5491133850211"><strong>+5491133850211</strong></a>
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
              Revisar Ficha Clínica
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
interface ApprovalEmailProps {
  patientName: string;
  serviceName: string;
  precioTratamiento: string; // Precio total del tratamiento
  valorSena: string; // Valor base de la seña (50.000)
  cobroServicio: string; // 8.25% de la seña
  totalAPagarMP: string; // Seña + 8.25%
  saldoRestante: string; // Precio Tratamiento - Seña
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
            Nuestro equipo de especialistas ha revisado tu Ficha Clínica y nos alegra confirmarte que <strong>eres apto/a</strong> para el tratamiento de <strong>${serviceName}</strong>.
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
              <span style="color: ${THEME.textMuted};">Cargos por servicio:</span>
              <strong style="color: ${THEME.textDark};">$${cobroServicio}</strong>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #dce4ef;">
              <span style="font-weight: 600; color: ${THEME.textDark}; font-size: 16px;">Total a pagar ahora:</span>
              <strong style="color: ${THEME.primary}; font-size: 18px;">$${totalAPagarMP}</strong>
            </div>
          </div>
          
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              El día de tu turno deberás abonar en Zoe Plasma Beauty el saldo restante de:<br>
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
              <strong>Aviso importante:</strong> Si no realizas el pago en las próximas horas, el sistema podría liberar tu espacio y deberas iniciar el proceso nuevamente.
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
// CONTRATO ESTRICTO: Se añade el motivo de rechazo enviado por el Administrador.
interface RejectionEmailProps {
  patientName: string;
  serviceName: string;
  rejectionReason: string; // Campo obligatorio
}

export const getRejectionEmail = ({
  patientName,
  serviceName,
  rejectionReason // Extraemos la variable
}: RejectionEmailProps): string => {
  
  // Preparamos el mensaje para WhatsApp codificando los espacios y caracteres especiales
  const waMessage = encodeURIComponent(`Hola equipo de Zoe Plasma Beauty. Soy ${patientName}, me comunico porque he recibido un correo de cancelación sobre mi turno para ${serviceName} y quisiera hacer una consulta.`);
  const waLink = `https://wa.me/5491133850211?text=${waMessage}`;

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark};">
      <div style="max-width: 550px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 20px; margin-top: 0;">Hola, <strong>${patientName}</strong></h2>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Nuestro equipo de especialistas ha evaluado cuidadosamente tu Ficha Clínica. Priorizando siempre tu salud y seguridad, hemos determinado que en este momento <strong>no es seguro proceder con el tratamiento de ${serviceName}</strong>.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Motivo de la decisión clínica:</p>
            <p style="margin: 0; color: #b91c1c; font-size: 15px; line-height: 1.6; font-style: italic;">
              "${rejectionReason}"
            </p>
          </div>
          
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Tu turno ha sido cancelado y no se ha realizado ningún cobro.
          </p>
          
          <div style="margin: 40px 0; text-align: center; border-top: 1px dashed ${THEME.border}; padding-top: 30px;">
            <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 14px; margin-bottom: 20px;">
              Si consideras que hubo un error al llenar la ficha, si tus condiciones han cambiado, o si deseas consultar sobre otras alternativas aptas para ti, nuestro equipo está a tu entera disposición.
            </p>
            <a href="${waLink}" 
               style="background-color: #25D366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.2);">
              Contactar por WhatsApp
            </a>
          </div>
          
          ${FOOTER_HTML}
        </div>
      </div>
    </div>
  `;
};

// ============================================================================
// 5. PLANTILLA: CANCELACIÓN MANUAL CON MOTIVO (Panel Admin -> Paciente)
// ============================================================================
interface CancellationEmailProps {
  patientName: string;
  serviceName: string;
  cancellationReason: string;
}

export const getCancellationEmail = ({
  patientName,
  serviceName,
  cancellationReason
}: CancellationEmailProps): string => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark};">
      <div style="max-width: 550px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 20px; margin-top: 0;">Hola, <strong>${patientName}</strong></h2>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Te escribimos para informarte que ha habido una actualización respecto a tu reserva para el tratamiento de <strong>${serviceName}</strong>.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Estado: Turno Cancelado</p>
            <p style="margin: 0; color: #b91c1c; font-size: 15px; line-height: 1.6; font-style: italic;">
              "${cancellationReason}"
            </p>
          </div>
          
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Si necesitas reprogramar tu turno o tienes alguna consulta adicional sobre este aviso, no dudes en contactarnos directamente por WhatsApp.
          </p>
          
          ${FOOTER_HTML}
        </div>
      </div>
    </div>
  `;
};

// ============================================================================
// 6. PLANTILLA: REPROGRAMACIÓN DE TURNO (Panel Admin -> Paciente)
// ============================================================================
interface ReprogrammingEmailProps {
  patientName: string;
  serviceName: string;
  newDateFormatted: string;
}

export const getReprogrammingEmail = ({
  patientName,
  serviceName,
  newDateFormatted
}: ReprogrammingEmailProps): string => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${THEME.bgPage}; padding: 40px 20px; color: ${THEME.textDark};">
      <div style="max-width: 550px; margin: 0 auto; background-color: ${THEME.bgCard}; border-radius: 16px; overflow: hidden; border: 1px solid ${THEME.border};">
        
        ${HEADER_HTML}
        
        <div style="padding: 40px 30px;">
          <h2 style="color: ${THEME.textDark}; font-weight: 300; font-size: 20px; margin-top: 0;">Hola, <strong>${patientName}</strong></h2>
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Te confirmamos que el horario de tu turno ha sido modificado exitosamente.
          </p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #0369a1; text-transform: uppercase; letter-spacing: 1px;">Nuevo Horario Confirmado</p>
            <p style="margin: 0 0 15px 0; font-weight: bold; font-size: 16px; color: ${THEME.textDark}; text-transform: capitalize;">${newDateFormatted}</p>
            
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #0369a1; text-transform: uppercase; letter-spacing: 1px;">Tratamiento</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px; color: ${THEME.textDark};">${serviceName}</p>
          </div>
          
          <p style="line-height: 1.6; color: ${THEME.textMuted}; font-size: 15px;">
            Por favor, toma nota de este cambio. El resto de las condiciones y detalles de tu reserva se mantienen sin alteraciones.
          </p>
          
          ${FOOTER_HTML}
        </div>
      </div>
    </div>
  `;
};