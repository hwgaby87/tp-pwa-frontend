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

export const LOCALSTORAGE_TOKEN_KEY = 'auth_token_slack';

/**
 * Decodifica un token JWT para extraer la información del usuario.
 * @param {string} token - Token JWT.
 * @returns {Object|null} Información del usuario decodificada o null si falla.
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
 * Maneja la persistencia del token en localStorage y el estado global del usuario.
 * 
 * @component
 */
function AuthContextProvider({ children }) {
    const navigate = useNavigate();
    const [isLogged, setIsLogged] = useState(
        Boolean(localStorage.getItem(LOCALSTORAGE_TOKEN_KEY))
    );
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY);
        if (token) {
            const userData = decodeToken(token);
            if (userData) {
                setUser(userData);
                setIsLogged(true);
            } else {
                localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY);
                setIsLogged(false);
                setUser(null);
            }
        }
    }, []);

    function manageLogin(auth_token) {
        localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, auth_token);
        const userData = decodeToken(auth_token);
        setUser(userData);
        setIsLogged(true);
        navigate('/home');
    }

    function logout() {
        localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY);
        setIsLogged(false);
        setUser(null);
        navigate('/login');
    }

    const providerValues = {
        isLogged,
        user,
        manageLogin,
        logout
    };

    return (
        <AuthContext.Provider value={providerValues}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;