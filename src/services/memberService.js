import ENVIRONMENT from "../config/environment";
import { LOCALSTORAGE_TOKEN_KEY } from "../context/AuthContext";

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
