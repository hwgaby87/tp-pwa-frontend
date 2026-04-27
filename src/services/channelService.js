import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

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
