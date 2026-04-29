/**
 * @file environment.js
 * @description Configuración de las variables de entorno para el frontend.
 * Centraliza el acceso a variables como la URL de la API.
 */
const ENVIRONMENT = {
    API_URL: import.meta.env.VITE_API_URL
}

export default ENVIRONMENT