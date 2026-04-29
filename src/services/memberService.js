/**
 * @file memberService.js
 * @description Servicio para la gestión de miembros dentro de un espacio de trabajo.
 * Permite invitar nuevos usuarios, listar miembros, eliminarlos y actualizar sus roles.
 */

import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

/**
 * Envía una invitación a un usuario por correo electrónico.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} email - Correo del usuario a invitar.
 * @param {string} [role='user'] - Rol asignado.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function inviteMember(workspace_id, email, role = 'user') {
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/workspaces/${workspace_id}/members`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ email, role })
        }
    )

    const response = await response_http.json()
    return response
}

/**
 * Obtiene la lista de miembros de un workspace.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @returns {Promise<Object>} Lista de miembros.
 */
export async function getMembers(workspace_id) {
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/workspaces/${workspace_id}/members`,
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
 * Elimina a un miembro del workspace.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} member_id - ID del miembro a eliminar.
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function removeMember(workspace_id, member_id) {
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/workspaces/${workspace_id}/members/${member_id}`,
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
 * Actualiza el rol de un miembro.
 * @param {string} workspace_id - ID del espacio de trabajo.
 * @param {string} member_id - ID del miembro.
 * @param {string} role - Nuevo rol ('admin', 'user', etc).
 * @returns {Promise<Object>} Respuesta de la API.
 */
export async function updateMemberRole(workspace_id, member_id, role) {
    const response_http = await fetch(
        `${ENVIRONMENT.API_URL}/api/workspaces/${workspace_id}/members/${member_id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
            },
            body: JSON.stringify({ role })
        }
    )

    const response = await response_http.json()
    return response
}
