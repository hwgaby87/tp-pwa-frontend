import { useState } from "react";

/* 
Manejar con estados de react el estado actual de una consulta HTTP

EJEMPLO:
Traigo productos de la API
    loading: es un estado booleano que representa si la operacion esta cargando o no
    error: Es un estado que representa el error de la operacion (SI lo hay, sino es null)
    response: Es un estado que representa la respuesta de la operacion (Si la hay, sino es null)
La idea es usar a useRequest POR CADA CONSULTA AL SERVIDOR
Nos sirve para centralizar y reutilizar el comoportamiento a nivel de estados de nuestra app cuando hace una consulta al servidor
*/

function useRequest (){
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    /* 
    Recibe una funcion que emita un consulta al servidor por parametro (Callback)
    */
    async function sendRequest( {requestCb} ){
        console.log('hola')
        try{
            setResponse(null) //Si habia una consulta anterior quiero limpiar la respuesta
            setError(null) //Si habia una consulta anterior quiero limpiar el error
            setLoading(true) //Como inicio una consulta al servidor quiero marcar que estamos cargando la respuesta
            const response = await requestCb()
        
            setResponse(response) //Se guarda la respuesta
        }
        catch(error){
            console.log(error)
            setError(error) //Se guarda el error
        }
        finally{
            setLoading(false) //Pase lo que pase (error o todo bien) cargando vuelve a ser false
        }
    }


    return {
        sendRequest, //Funcion para activar una consulta al servidor
        response, //Estado que guarda el estado de respuesta del servidor
        error, //Estado que guarda el estado de error del servidor
        loading //Estado que guarda el estado de cargando del servidor
    }
}

export default useRequest