/**
 * @file AuthContext.jsx
 * @description Gestión del estado global de autenticación del usuario.
 * Utiliza el Context API de React para proveer datos del usuario y métodos de login/logout.
 */

import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Contexto de autenticación para toda la aplicación.
 * Proporciona el estado de logueo, los datos del usuario y funciones de control.
 */
export const AuthContext = createContext({
    isLogged: false,
    user: null,
    manageLogin: (auth_token) => {},
    logout: () => {}
});

/** Clave utilizada para persistir el token en el almacenamiento local del navegador */
export const LOCALSTORAGE_TOKEN_KEY = 'auth_token_slack';

/**
 * Decodifica un token JWT para extraer la información del usuario de forma manual.
 * No requiere librerías externas de JWT en el frontend.
 * @param {string} token - Token JWT codificado en Base64.
 * @returns {Object|null} Información del usuario decodificada o null si el token es inválido.
 */
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

/**
 * Proveedor del contexto de autenticación.
 * Maneja la persistencia del token en localStorage y sincroniza el estado global.
 * 
 * @component
 */
function AuthContextProvider({ children }) {
    const navigate = useNavigate();
    
    /** Estado que indica si el usuario tiene una sesión activa */
    const [isLogged, setIsLogged] = useState(
        Boolean(localStorage.getItem(LOCALSTORAGE_TOKEN_KEY))
    );
    
    /** Datos del usuario extraídos del token (nombre, email, id, imagen) */
    const [user, setUser] = useState(null);

    /** Al montar el componente, verifica si existe un token válido y recupera al usuario */
    useEffect(() => {
        const token = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY);
        if (token) {
            const userData = decodeToken(token);
            if (userData) {
                setUser(userData);
                setIsLogged(true);
            } else {
                // Si el token está corrupto, limpia la sesión
                localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY);
                setIsLogged(false);
                setUser(null);
            }
        }
    }, []);

    /**
     * Procesa el inicio de sesión exitoso.
     * @param {string} auth_token - Token JWT entregado por el backend.
     */
    function manageLogin(auth_token) {
        localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, auth_token);
        const userData = decodeToken(auth_token);
        setUser(userData);
        setIsLogged(true);
        navigate('/home');
    }

    /**
     * Cierra la sesión del usuario eliminando el token y redirigiendo al login.
     */
    function logout() {
        localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY);
        setIsLogged(false);
        setUser(null);
        navigate('/login');
    }

    /**
     * Actualiza el token almacenado (útil después de actualizar el perfil).
     * @param {string} newToken - El nuevo token JWT con datos actualizados.
     */
    function updateToken(newToken) {
        localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, newToken);
        const userData = decodeToken(newToken);
        if (userData) {
            setUser(userData);
        }
    }

    const providerValues = {
        isLogged,
        user,
        manageLogin,
        logout,
        setUser,
        updateToken
    };

    return (
        <AuthContext.Provider value={providerValues}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;