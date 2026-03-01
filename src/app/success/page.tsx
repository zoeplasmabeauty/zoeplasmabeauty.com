/**
 * ARCHIVO: src/app/success/page.tsx
 * ARQUITECTURA: Componente Frontend (Página Pública de Next.js)
 * * PROPÓSITO ESTRATÉGICO:
 * Actuar como la "Sala de Aterrizaje" (Landing Page) visual una vez que el paciente
 * completa el pago en la bóveda de Mercado Pago. Es una pantalla de confirmación 
 * psicológica que transmite tranquilidad y profesionalismo clínico.
 * * RESPONSABILIDADES:
 * 1. Feedback Visual: Mostrar un mensaje claro de éxito en la transacción.
 * 2. Manejo de Expectativas: Informar al paciente cuáles son los siguientes pasos 
 * (revisar su correo y esperar el mensaje de WhatsApp).
 * 3. Enrutamiento: Proveer un botón seguro para volver a la página principal.
 * * NOTA ARQUITECTÓNICA CRÍTICA:
 * Esta página NO actualiza la base de datos ni envía correos. Es 100% visual y estática.
 * La lógica de confirmación real ocurrirá en el Webhook (Backstage) de Mercado Pago para evitar 
 * que un cierre accidental del navegador del paciente cancele la reserva.
 */

import Link from 'next/link';

export default function SuccessPage() {
  return (
    // CONTENEDOR PRINCIPAL: Ocupa el 100% del alto de la pantalla (min-h-screen).
    // Alinea todo el contenido en el centro absoluto usando Flexbox.
    // Usamos un fondo suave (bg-gray-50) para mantener la estética limpia de Zoe Plasma.
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      
      {/* TARJETA CENTRAL (La "Consola Visual") */}
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center transform transition-all">
        
        {/* 1. ÍCONO DE ÉXITO (Señal Visual Primaria) */}
        {/* Un círculo verde con un checkmark en SVG nativo para evitar instalar librerías de íconos */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
          <svg 
            className="h-12 w-12 text-green-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* 2. ENCABEZADOS (Mensaje Principal) */}
        {/* Tipografía contrastante: combinamos fuentes ligeras (font-light) con negritas (font-semibold) */}
        <h1 className="text-4xl font-light text-gray-900 mb-4">
          ¡Pago <span className="font-semibold text-stone-700">Exitoso</span>!
        </h1>
        
        <h2 className="text-xl text-gray-600 mb-8 font-medium">
          Tu reserva en Zoe Plasma Beauty está asegurada.
        </h2>

        {/* 3. INSTRUCCIONES POST-COMPRA (Manejo de Expectativas) */}
        {/* Caja gris suave para destacar claramente los siguientes pasos del protocolo de la clínica */}
        <div className="bg-gray-50 rounded-2xl p-6 text-left mb-10 border border-gray-100">
          <p className="text-sm text-gray-600 mb-4 flex items-start">
            <span className="mr-3 text-stone-800 font-bold">1.</span>
            El recibo de Mercado Pago y la confirmación oficial han sido enviados a tu correo electrónico.
          </p>
          <p className="text-sm text-gray-600 flex items-start">
            <span className="mr-3 text-stone-800 font-bold">2.</span>
            Nuestro equipo se pondrá en contacto contigo vía WhatsApp a la brevedad para brindarte las indicaciones previas a tu evaluación.
          </p>
        </div>

        {/* 4. BOTÓN DE RETORNO (Lazo de navegación) */}
        {/* Usa el componente 'Link' optimizado de Next.js para volver al 'Home' sin recargar la página entera */}
        <Link 
          href="/"
          className="inline-block w-full py-4 px-6 rounded-2xl font-bold text-lg text-white bg-stone-800 hover:bg-stone-900 active:scale-[0.98] transition-all shadow-md shadow-stone-200"
        >
          Volver al Inicio
        </Link>

      </div>
    </div>
  );
}