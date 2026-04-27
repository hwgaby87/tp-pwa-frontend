import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

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
