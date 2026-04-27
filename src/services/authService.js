import ENVIRONMENT from "../config/environment"

/**
 * Inicia sesión de un usuario.
 * @param {Object} credentials - Credenciales de acceso.
 * @param {string} credentials.email - Correo electrónico.
 * @param {string} credentials.password - Contraseña.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function login ({email, password}){
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/auth/login`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    email, 
                    password
                }
            )
        }
    )

    const response = await response_http.json()
    return response
}


/**
 * Registra un nuevo usuario.
 * @param {Object} data - Datos del usuario.
 * @param {string} data.email - Correo electrónico.
 * @param {string} data.password - Contraseña.
 * @param {string} data.name - Nombre completo.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function register ({email, password, name}){
    console.log("fetch")
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/auth/register`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    email, 
                    password,
                    name
                }
            )
        }
    )
    const response = await response_http.json()
    return response
}

/**
 * Solicita el restablecimiento de contraseña.
 * @param {Object} data - Datos de la solicitud.
 * @param {string} data.email - Correo electrónico.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function resetPasswordRequest ({email}){
    /* 
    fetch sirve para hacer consultas HTTP
    */
     const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/auth/reset-password-request`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json" //Indica que enviamos un JSON
            },
            body: JSON.stringify( // Convertimos el objeto a JSON
                {
                    email
                }
            )
        }
    )

    const response = await response_http.json()
    return response
}

export async function resetPassword ({password, reset_password_token}){
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/auth/reset-password/${reset_password_token}`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    password
                }
            )
        }
    )

    const response = await response_http.json()
    return response
}