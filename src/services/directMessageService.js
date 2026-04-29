/**
 * @file directMessageService.js
 * @description Servicio para la gestión de mensajes directos (DMs) entre miembros.
 * Proporciona funciones para chatear privadamente, eliminar mensajes y gestionar estados de lectura.
 */

import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

/**
 * Obtiene el historial de mensajes de un chat directo.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} other_member_id - ID del otro participante.
 * @returns {Promise<Object>} Lista de mensajes.
 */
export async function getDirectMessages(workspace_id, other_member_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/direct-messages/${other_member_id}`,
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
 * Envía un mensaje directo.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} receiver_member_id - ID del receptor.
 * @param {string} content - Texto del mensaje.
 * @returns {Promise<Object>} El mensaje enviado.
 */
export async function sendDirectMessage(workspace_id, receiver_member_id, content) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/direct-messages/${receiver_member_id}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ content })
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Elimina un mensaje directo.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} message_id - ID del mensaje a borrar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function deleteDirectMessage(workspace_id, message_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/direct-messages/${message_id}`,
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
 * Marca un mensaje directo como leído.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} message_id - ID del mensaje.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function markDirectMessageAsRead(workspace_id, message_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/direct-messages/${message_id}/read`,
        {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )
    return await response_http.json()
}

export async function markDirectMessageAsReceived(workspace_id, message_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/direct-messages/${message_id}/received`,
        {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )
    return await response_http.json()
}
