# Conecta - Plataforma de Comunicación para Equipos

[![Vercel Status](https://img.shields.io/badge/Vercel-Deployed-success?style=flat-square&logo=vercel)](https://tp-utn-pwa-web.vercel.app/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/Node-18.x+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)

**Conecta** es una plataforma de comunicación centralizada diseñada para optimizar la colaboración en equipos académicos y profesionales. El proyecto resuelve la necesidad de un entorno unificado donde los usuarios pueden gestionar múltiples espacios de trabajo, organizar conversaciones en canales y mantener diálogos directos, todo bajo una experiencia de usuario fluida y responsiva. Esta aplicación fue desarrollada como trabajo final integrador de la **Diplomatura FullStack - Backend Developer de la Universidad Tecnológica Nacional (UTN)**.

---

## 🔗 Demo en vivo

La aplicación se encuentra desplegada y disponible en tiempo real:

🚀 **[https://tp-utn-pwa-web.vercel.app/](https://tp-utn-pwa-web.vercel.app/)**


## ✨ Funcionalidades principales

- **Gestión de workspaces:** el sistema permite crear y personalizar múltiples espacios de trabajo, incluyendo la carga y eliminación de imágenes de perfil exclusivas para cada espacio.
- **Canales temáticos:** la comunicación se organiza por proyectos o temas mediante canales que pueden crearse, editarse y archivarse según las necesidades del equipo.
- **Mensajería instantánea:** la plataforma ofrece chat en tiempo real con soporte para eliminación de mensajes y seguimiento de hilos de conversación.
- **Mensajes directos:** los miembros de un mismo espacio de trabajo pueden comunicarse de forma privada a través de conversaciones uno a uno.
- **Sistema de archivados:** un panel dedicado permite recuperar canales y workspaces archivados, garantizando que ninguna información se pierda definitivamente.
- **Diseño responsivo inteligente:** la interfaz está optimizada para dispositivos móviles con un menú lateral que se adapta verticalmente en resoluciones críticas.
- **Gestión de miembros:** el sistema incluye invitaciones y control de roles (Creador, Admin, Miembro) dentro de cada espacio de trabajo.

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Uso en el proyecto |
| :--- | :--- | :--- |
| **React** | 19.2 | Biblioteca principal de UI y gestión de componentes |
| **Vite** | 8.0 | Herramienta de construcción y entorno de desarrollo |
| **React Router** | 7.1 | Gestión de navegación y enrutamiento dinámico |
| **Vanilla CSS** | — | Sistema de estilos artesanal con variables dinámicas |
| **Sonner** | 2.0 | Gestión de notificaciones y feedback de usuario |
| **Context API** | — | Gestión del estado global de autenticación |
| **Node.js** | 18.x+ | Entorno de ejecución requerido |
| **Vercel** | — | Plataforma de despliegue y hosting continuo |

---

## 🎓 Contexto académico

Esta aplicación fue desarrollada como proyecto final integrador para validar los conocimientos adquiridos durante la diplomatura.

- **Institución:** Universidad Tecnológica Nacional (UTN)
- **Diplomatura:** FullStack - Backend Developer
- **Módulos aplicados:**
  - Desarrollo Frontend con React Avanzado
  - Consumo de APIs RESTful
  - Autenticación segura con JWT
  - Arquitectura de Software y Patrones de Diseño

---

## ⚙️ Requisitos previos

Para ejecutar este proyecto localmente se requiere contar con:

- **Node.js** v18.0.0 o superior
- **npm** v9.0.0 o superior
- Una instancia del **Backend de Conecta** en ejecución (local o remota)

---

## 🚀 Instalación y configuración local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/hwgaby87/tp-pwa-frontend.git
   cd tp-pwa-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Se debe crear un archivo `.env` en la raíz del proyecto tomando como referencia el siguiente ejemplo:
   ```env
   VITE_API_URL=https://tu-api-url.com
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación:**
   Una vez iniciado el servidor, la app estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 📂 Estructura del proyecto

```text
src/
├── components/       # Componentes UI reutilizables (Sidebar, Modals, Buttons)
├── config/           # Configuración de variables globales (Environment)
├── context/          # Contextos globales (AuthContext para seguridad)
├── hooks/            # Hooks personalizados para lógica reutilizable
├── middlewares/      # Protectores de rutas (ProtectedRoute)
├── screens/          # Pantallas principales (Workspace, Login, Register, Home)
├── services/         # Capa de comunicación con la API (Fetch/REST)
├── utils/            # Funciones de utilidad (manejador de mensajes, formateadores)
└── main.jsx          # Punto de entrada de la aplicación
```

---

## 🏛️ Decisiones de arquitectura

1. **Estrategia de renderizado:** se optó por **Client Side Rendering (CSR)** utilizando Vite para garantizar una interactividad de tipo aplicación (PWA) inmediata, fundamental para un entorno de chat en tiempo real.
2. **Organización de componentes:** el proyecto sigue el patrón de **Componentes Presentacionales y Contenedores** (Screens) para separar la lógica de negocio de la visualización.
3. **Capa de servicios:** todas las peticiones fetch están centralizadas en archivos dedicados por recurso (`workspaceService`, `channelService`, etc.), lo que facilita el mantenimiento ante cambios en el backend.
4. **Manejo de errores centralizado:** se implementó un `messageHandler` que traduce códigos de error técnicos a mensajes amigables en español para el usuario final.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia MIT. Para más información, consultar el archivo [LICENSE](./LICENSE).

## Autor

Haberkorn Gabriela