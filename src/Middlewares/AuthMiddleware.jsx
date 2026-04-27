/* 
Un componente a nivel de ruta que va a checkear si el usuario tiene o no sesion
En caso de no tener redirecciona a login
En caso de tener deja pasar
*/


import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Navigate, Outlet } from 'react-router'

const AuthMiddleware = () => {
    const {isLogged} =  useContext(AuthContext)
    return (
        <>
            {
                isLogged 
                ? <Outlet/>
                : <Navigate to={'/login'}/>
            }
        </>
    )
}

export default AuthMiddleware