/**
 * @file channelService.js
 * @description Servicio para la gestión de canales dentro de los espacios de trabajo.
 * Permite listar, crear, editar, eliminar y restaurar canales.
 */

import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

/**
 * Obtiene todos los canales activos de un workspace específico.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @returns {Promise<Object>} Lista de canales activos.
 */
export async function getChannels(workspace_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/channels',
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
 * Obtiene la lista de canales eliminados (archivados) de un workspace.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @returns {Promise<Object>} Lista de canales eliminados.
 */
export async function getDeletedChannels(workspace_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/channels/deleted',
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
 * Crea un nuevo canal en un workspace.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} name - Nombre del nuevo canal.
 * @param {string} description - Descripción del canal.
 * @returns {Promise<Object>} Canal creado.
 */
export async function createChannel(workspace_id, name, description) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/channels',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ name, description })
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Actualiza el nombre de un canal existente.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} channel_id - ID del canal a editar.
 * @param {string} name - Nuevo nombre para el canal.
 * @returns {Promise<Object>} Canal actualizado.
 */
export async function updateChannel(workspace_id, channel_id, name) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/channels/' + channel_id,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ name })
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Elimina (archiva) un canal.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} channel_id - ID del canal a eliminar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function deleteChannel(workspace_id, channel_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/channels/' + channel_id,
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
 * Restaura un canal que fue previamente eliminado.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} channel_id - ID del canal a restaurar.
 * @returns {Promise<Object>} Resultado de la operación.
 */
export async function restoreChannel(workspace_id, channel_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + '/api/workspaces/' + workspace_id + '/channels/' + channel_id + '/restore',
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
