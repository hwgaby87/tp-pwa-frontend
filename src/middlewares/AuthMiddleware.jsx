/**
 * @file AuthMiddleware.jsx
 * @description Middleware a nivel de ruta que verifica si el usuario tiene una sesión activa.
 * Si el usuario está autenticado, permite el acceso a las rutas hijas (Outlet).
 * En caso contrario, redirige al usuario a la pantalla de inicio de sesión (/login).
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