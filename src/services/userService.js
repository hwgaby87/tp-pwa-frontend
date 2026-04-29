import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

/**
 * Obtiene el token de autenticación del localStorage.
 * @returns {string|null} Token de acceso.
 */
const getAuthToken = () => localStorage.getItem(LOCALSTORAGE_TOKEN_KEY);

/**
 * Actualiza la foto de perfil del usuario.
 * @param {File} file - El archivo de imagen a subir.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function uploadProfilePicture(file) {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);

    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/users/profile-picture`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // No configuramos Content-Type para dejar que el navegador maneje el boundary del FormData
            },
            body: formData
        }
    );

    const response = await response_http.json();
    if (!response_http.ok) {
        response.ok = false;
    }
    return response;
}

/**
 * Elimina la foto de perfil del usuario.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function deleteProfilePicture() {
    const token = getAuthToken();

    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/users/profile-picture`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    const response = await response_http.json();
    if (!response_http.ok) {
        response.ok = false;
    }
    return response;
}

/**
 * Actualiza los datos del usuario.
 * @param {Object} userData - Datos a actualizar.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function updateUserData(userData) {
    const token = getAuthToken();
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/users`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        }
    );

    const response = await response_http.json();
    if (!response_http.ok) {
        response.ok = false;
    }
    return response;
}
