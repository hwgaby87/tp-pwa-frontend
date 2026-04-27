import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import { AuthContext } from '../../context/AuthContext'
import Alert from '../../components/Alert/Alert'
import { getFriendlyMessage } from '../../utils/messageHandler'

const LoginScreen = () => {

    const {
        sendRequest, 
        error, 
        response, 
        loading
    } = useRequest()

    const LOGIN_FORM_FIELDS = {
        EMAIL: 'email',
        PASSWORD: 'password'
    }

    const initialFormState = {
        [LOGIN_FORM_FIELDS.EMAIL]: '',
        [LOGIN_FORM_FIELDS.PASSWORD]: ''
    }

    const {manageLogin} = useContext(AuthContext)
    const [errorMessage, setErrorMessage] = useState(null)

    function onLogin (formState){
        sendRequest({
            requestCb: async () => {
                return await login({
                    email: formState[LOGIN_FORM_FIELDS.EMAIL],
                    password: formState[LOGIN_FORM_FIELDS.PASSWORD]
                })
            }
        })
    }

    const {
        handleChangeInput, //Funcion de cambio del input, debemos asociarlas a cada input
        onSubmit, //Funcion que asociaremos al evento submit del formario
        formState
    } = useForm({ //Usamos useForm cada vez que tengamos que capurar campos de un formulario (Manejo de formularios)
        initialFormState,  //Estado incial del formulario
        submitFn: onLogin //Funcion que se activa al enviar formulario
    })

    /* 
    La funcion se carga cada vez que cambie response
    */
    useEffect(
        () => {
            if (error) {
                setErrorMessage(getFriendlyMessage(error));
            } else if (response) {
                if (response.ok) {
                    //Guardo el token en mi contexto
                    manageLogin(response.data.auth_token)
                } else {
                    setErrorMessage(getFriendlyMessage(response));
                }
            }
        },
        [response, error]
    )

    return (
        <div className="auth-container">
            <div className="auth-card">
                <Link to="/" className="back-link">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Volver
                </Link>
                
                <div className="auth-header">
                    <div className="auth-header-logo">
                        <svg width="64" height="64" viewBox="0 0 100 100">
                            <rect width="100" height="100" rx="24" fill="var(--accent-color)"/>
                            <path d="M 65 35 A 20 20 0 1 0 65 65" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round"/>
                            <circle cx="65" cy="35" r="8" fill="#ffffff"/>
                            <circle cx="65" cy="65" r="8" fill="#ffffff"/>
                        </svg>
                    </div>
                    <h1>Iniciar sesión</h1>
                </div>
                
                <Alert type="error" message={errorMessage} />

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"  
                            name={LOGIN_FORM_FIELDS.EMAIL} 
                            onChange={handleChangeInput}
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            name={LOGIN_FORM_FIELDS.PASSWORD} 
                            onChange={handleChangeInput}
                            placeholder="Tu contraseña"
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Cargando...' : 'Iniciar sesión'}
                    </button>
                </form>
                <div className="auth-links">
                    <span>¿No tienes una cuenta? <Link to="/register">Registrarse</Link></span>
                    <span>¿Olvidaste tu contraseña? <Link to="/reset-password-request">Restablecer</Link></span>
                </div>
            </div>
        </div>
    )
}

export default LoginScreen