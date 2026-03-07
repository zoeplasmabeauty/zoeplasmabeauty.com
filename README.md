# 🧬 Zoe Plasma Beauty - Sistema de Gestión de turnos y Plataforma Web

Plataforma integral (Landing Page de alta conversión + Motor de Reservas Inteligente + Panel de Administración clínico) desarrollada para el centro de estética avanzada Zoe Plasma Beauty en Buenos Aires, Argentina.

Construida sobre una **Arquitectura Serverless (Edge Computing)**, garantizando tiempos de carga de milisegundos, alta disponibilidad y cero mantenimiento de servidores tradicionales.

---

## 🚀 Tecnologías y Ecosistema (Tech Stack)

Este proyecto está orquestado utilizando las mejores herramientas del mercado actual para garantizar escalabilidad, velocidad y seguridad:

### 💻 Core & Hosting
* **[Next.js (React)](https://nextjs.org/)**: Framework principal (App Router).
* **[Cloudflare Pages](https://pages.cloudflare.com/)**: Despliegue global en el Edge.
* **[GitHub](https://github.com/)**: Control de versiones y CI/CD automatizado (Despliegue con cada `git push`).

### 🗄️ Base de Datos & ORM
* **[Cloudflare D1](https://developers.cloudflare.com/d1/)**: Base de datos SQLite nativa en el Edge.
* **[Drizzle ORM](https://orm.drizzle.team/)**: Tipado estricto y ejecución rápida de consultas SQL.

### 🔌 Integraciones de Terceros (APIs)
* **[Mercado Pago](https://www.mercadopago.com.ar/developers/)**: Pasarela para el cobro automatizado de señas y reservas.
* **[Brevo (Ex Sendinblue)](https://www.brevo.com/)**: Motor SMTP para correos transaccionales (Confirmaciones, Triage médico, Alertas).
* **[cron-job.org](https://cron-job.org/)**: Servicio externo para "despertar" el endpoint seguro y enviar recordatorios automáticos de turnos diariamente.
* **[Cloudinary](https://cloudinary.com/)**: CDN para optimización y entrega ultrarrápida de imágenes (Antes y Después, Galería).
* **[YouTube API](https://developers.google.com/youtube/)**: Integración (embeds) para testimonios en video sin sobrecargar el peso de la web.

---

## ⚙️ Funcionalidades Principales (Key Features)

1. **Motor de Reservas "Radar de Colisiones":**
   * Cálculo matemático en tiempo real para evitar solapamiento de turnos.
   * Zonas horarias forzadas (`America/Argentina/Buenos_Aires`) para evitar desfases de servidor.
2. **Flujo de Triage Médico (Máquina de Estados):**
   * Los pacientes deben llenar una Ficha Clínica rigurosa antes de poder pagar.
   * El turno pasa por estados: `awaiting_triage` ➔ `under_review` ➔ `approved_unpaid` ➔ `confirmed`.
3. **Panel de Administración Blindado:**
   * Dashboard privado protegido por JWT y Cookies de sesión HTTP-Only.
   * Capacidad de cancelar (con envío de motivos por correo) y reprogramar (ajustando la duración dinámica del turno).
4. **Gestor de Cierres de Agenda (Vacaciones):**
   * Bloqueo global de fechas desde la base de datos sin necesidad de tocar el código.
5. **Motor CRON (Recordatorios el mismo día):**
   * Endpoint protegido por `CRON_SECRET` que dispara correos con saldo restante y ubicación en Google Maps a las 8:00 AM.

---

## 🛠️ Instalación y Entorno de Desarrollo Local

Si necesitas clonar este repositorio y correrlo en tu máquina local, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TuUsuario/zoe-plasma-beauty.git](https://github.com/TuUsuario/zoe-plasma-beauty.git)
cd zoe-plasma-beauty
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo .dev.vars en la raíz del proyecto y añade las siguientes claves (solicítalas al administrador):

```bash
# Seguridad
SECRET_ADMIN_PASSWORD="Contraseña_maestra_admin"
CRON_SECRET="secreto_para_ejecutar_cron_jobs"

# APIs de Terceros
BREVO_API_KEY="xkeysib-..."
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
```

### 3. Base de Datos Local (D1)
Genera y aplica las migraciones a tu entorno local SQLite:

```bash
npx drizzle-kit generate
npx wrangler d1 migrations apply zoe-plasma-db --local
```

### 4. Iniciar el Servidor
Dado que utilizamos las APIs de Cloudflare localmente, el proyecto se levanta con Wrangler:

```bash
npm run dev
```

La aplicación estará corriendo en `http://localhost:3000`.

---

## 👨‍💻 Autor y Desarrollo

Diseñado, desarrollado y desplegado para alto rendimiento por `peinadoso`.

* Arquitectura: Serverless & Edge Computing.

* Filosofía: UX con la minima fricción posible.

**© 2026 Zoe Plasma Beauty - Todos los derechos reservados.** 