import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'
import useRequest from '../../hooks/useRequest'
import { AuthContext } from '../../context/AuthContext'
import { Alert } from '../../components'
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
    const [showPassword, setShowPassword] = useState(false)

    function onLogin (formState){
        setErrorMessage(null)
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
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                name={LOGIN_FORM_FIELDS.PASSWORD} 
                                onChange={handleChangeInput}
                                placeholder="Tu contraseña"
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
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