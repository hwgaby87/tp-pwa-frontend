import { useEffect } from "react"
import useRequest from "./useRequest"
import { getWorkspaces } from "../services/workspaceService"

function useWorkspaces() {
    /* 
 Manejar la respuesta del servidor con useRequest o hook de preferencia
 Representar los estados en la pantalla, en especial el cargando y la lista de espacios de trabajo
 Cada espacio de trabajo debera mostrar el titulo y un link que diga 'abrir workspace' y lleve hacia '/workspace/:id_workspace

 Recomendacion:
   Usen un efecto que se ejecute solo una vez para cargar la lista de espacios de trabjo
 */

    const { sendRequest, response, loading, error } = useRequest()

    useEffect(
        () => {
            sendRequest(
                {
                    requestCb: getWorkspaces
                }
            )
        },
        []
    )
   


    return {
        response, 
        loading, 
        error,
        workspaces: response?.data?.workspaces
    }
}

export default useWorkspaces