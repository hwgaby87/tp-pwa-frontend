import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

export async function getMessages(workspace_id, channel_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}/messages`,
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

export async function sendMessage(workspace_id, channel_id, content) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}/messages`,
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

export async function deleteMessage(workspace_id, channel_id, message_id) {
    const response_http = await fetch(
        ENVIRONMENT.API_URL + `/api/workspaces/${workspace_id}/channels/${channel_id}/messages/${message_id}`,
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
