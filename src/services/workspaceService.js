/**
 * @file workspaceService.js
 * @description Servicio para la gestión de espacios de trabajo (Workspaces).
 * Proporciona funciones para crear, leer, actualizar, eliminar y gestionar imágenes de workspaces.
 */

import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

/**
 * Obtiene la lista completa de workspaces disponibles para el usuario.
 * @returns {Promise<Object>} Respuesta de la API con la lista de workspaces.
 */
export async function getWorkspaces() {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces',
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Obtiene los detalles de un workspace específico por su ID.
 * @param {string} workspace_id - ID del workspace a consultar.
 * @returns {Promise<Object>} Detalle del workspace.
 */
export async function getWorkspaceById(workspace_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Crea un nuevo espacio de trabajo.
 * @param {string} title - Título del workspace.
 * @param {string} [description=''] - Descripción opcional.
 * @returns {Promise<Object>} Workspace creado.
 */
export async function createWorkspace(title, description = '') {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ title, description })
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Actualiza los datos básicos de un workspace.
 * @param {string} workspace_id - ID del workspace.
 * @param {string} title - Nuevo título.
 * @param {string} [description=''] - Nueva descripción.
 * @returns {Promise<Object>} Workspace actualizado.
 */
export async function updateWorkspace(workspace_id, title, description = '') {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ title, description })
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Archiva (elimina lógicamente) un workspace.
 * @param {string} workspace_id - ID del workspace.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function deleteWorkspace(workspace_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id,
        {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Restaura un workspace archivado anteriormente.
 * @param {string} workspace_id - ID del workspace.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function restoreWorkspace(workspace_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/restore',
        {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Agrega un usuario como miembro de un workspace.
 * @param {string} workspace_id - ID del workspace.
 * @param {string} user_id - ID del usuario a invitar.
 * @returns {Promise<Object>} Resultado de la invitación.
 */
export async function addUserToWorkspace(workspace_id, user_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/users',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ user_id })
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Elimina a un usuario de un workspace.
 * @param {string} workspace_id - ID del workspace.
 * @param {string} user_id - ID del usuario a remover.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function removeUserFromWorkspace(workspace_id, user_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/users/' + user_id,
        {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Obtiene todos los workspaces a los que pertenece un usuario específico.
 * @param {string} user_id - ID del usuario.
 * @returns {Promise<Object>} Lista de workspaces del usuario.
 */
export async function getUserWorkspaces(user_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/users/' + user_id + '/workspaces',
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Sube una imagen de perfil para el workspace.
 * @param {string} workspace_id - ID del workspace.
 * @param {File} imageFile - Archivo de imagen (jpg, png, etc).
 * @returns {Promise<Object>} Respuesta con la URL de la imagen cargada.
 */
export async function uploadWorkspaceImage(workspace_id, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/image',
        {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
                // Content-Type se establece automáticamente para FormData
            },
            body: formData
        }
    );

    const response = await response_http.json();
    return response;
}

/**
 * Elimina la imagen de perfil actual de un workspace.
 * @param {string} workspace_id - ID del workspace.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function deleteWorkspaceImage(workspace_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/image',
        {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    );

    const response = await response_http.json();
    return response;
}