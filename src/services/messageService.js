/**
 * @file messageService.js
 * @description Servicio para la gestión de mensajes en canales públicos.
 * Proporciona funciones para obtener, enviar y eliminar mensajes de los canales.
 */

import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

/**
 * Obtiene todos los mensajes de un canal específico.
 * 
 * @param {string} workspace_id - El ID del espacio de trabajo.
 * @param {string} channel_id - El ID del canal.
 */
export async function getMessages(workspace_id, channel_id) {
    // Hacemos una petición GET al servidor pidiendo los mensajes
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}/messages`,
        {
            method: 'GET',
            headers: {
                // Enviamos el token de seguridad para que el servidor sepa quién somos
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    // Convertimos la respuesta del servidor en un objeto que JavaScript pueda usar
    const response = await response_http.json()
    return response
}

/**
 * Envía un nuevo mensaje a un canal.
 * 
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} channel_id - ID del canal.
 * @param {string} content - El texto del mensaje.
 */
export async function sendMessage(workspace_id, channel_id, content) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}/messages`,
        {
            method: 'POST', // Usamos POST para crear o enviar algo nuevo
            headers: {
                'Content-Type': 'application/json', // Indicamos que enviamos datos en formato JSON
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ content }) // El contenido del mensaje se convierte a texto JSON
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Elimina un mensaje por su ID.
 */
export async function deleteMessage(workspace_id, channel_id, message_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}/messages/${message_id}`,
        {
            method: 'DELETE', // Método para borrar
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            }
        }
    )

    const response = await response_http.json()
    return response
}
