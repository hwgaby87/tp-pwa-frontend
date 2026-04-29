# Conecta - Plataforma de Comunicación para Equipos

**Conecta** es una aplicación web progresiva (PWA) diseñada para facilitar la comunicación y colaboración entre equipos de trabajo. Inspirada en plataformas líderes del sector, permite organizar conversaciones en espacios de trabajo, canales y mensajes directos, todo en un entorno moderno y eficiente.

## 🚀 Características Principales

- **Espacios de Trabajo:** Crea y gestiona múltiples entornos para diferentes proyectos o empresas.
- **Canales Organizados:** Divide las conversaciones por temas, equipos o proyectos específicos.
- **Mensajería en Tiempo Real:** Comunicación instantánea para mantener al equipo sincronizado.
- **Mensajes Directos:** Conversaciones privadas uno a uno con otros miembros del equipo.
- **Gestión de Invitaciones:** Sistema para invitar a nuevos miembros a unirse a los espacios de trabajo.
- **Interfaz Moderna y Responsiva:** Diseño premium adaptable a dispositivos móviles, tablets y escritorio.
- **Sistema de Notificaciones:** Alertas visuales mediante *Sonner* para una mejor experiencia de usuario.
- **Autenticación Completa:** Registro, inicio de sesión y recuperación de contraseña.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** [React.js](https://reactjs.org/) (v19)
- **Herramienta de Construcción:** [Vite](https://vitejs.dev/)
- **Enrutamiento:** [React Router](https://reactrouter.com/) (v7)
- **Estilos:** Vanilla CSS (Diseño personalizado y moderno)
- **Notificaciones:** [Sonner](https://sonner.emilkowal.ski/)
- **Iconos:** Emojis y tipografía moderna (Outfit)

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- [npm](https://www.npmjs.com/) (Viene incluido con Node.js)

## 🔧 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd tp-pwa-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configuración de variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y configura la URL de tu API backend:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

## 🚀 Ejecución del Proyecto

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

Para construir la versión de producción:
```bash
npm run build
```

## 📂 Estructura del Proyecto

```text
src/
├── components/   # Componentes reutilizables (Botones, Inputs, Modales, etc.)
├── config/       # Configuraciones globales y de API
├── context/      # Contextos de React (Autenticación, Temas)
├── hooks/        # Custom hooks para lógica compartida
├── middlewares/  # Componentes de protección de rutas
├── screens/      # Pantallas completas de la aplicación
├── services/     # Llamadas a la API backend
└── utils/        # Funciones de utilidad y formateo
```

## 📝 Documentación Adicional

El proyecto sigue estándares modernos de desarrollo React, utilizando componentes funcionales y hooks. La arquitectura está separada por capas para facilitar el mantenimiento y la escalabilidad:

- **Capa de Servicio:** Centraliza todas las peticiones HTTP al backend.
- **Capa de Contexto:** Gestiona el estado global de la aplicación (usuario autenticado).
- **Capa de Middleware:** Asegura que las rutas protegidas solo sean accesibles por usuarios logueados.

---

Desarrollado como parte de la **Diplomatura FullStack - Backend Developer (UTN)**.
