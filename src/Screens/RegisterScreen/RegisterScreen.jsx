import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { register } from '../../services/authService'
import Alert from '../../components/Alert/Alert'
import { getFriendlyMessage } from '../../utils/messageHandler'
import { toast } from 'sonner'

const RegisterScreen = () => {

    const {
        sendRequest,
        response,
        error,
        loading
    } = useRequest()

    const [successMessage, setSuccessMessage] = useState(null)

    const REGISTER_FORM_FIELDS = {
        EMAIL: 'email',
        PASSWORD: 'password',
        NAME: 'name'
    }

    const initialFormState = {
        [REGISTER_FORM_FIELDS.NAME]: '',
        [REGISTER_FORM_FIELDS.EMAIL]: '',
        [REGISTER_FORM_FIELDS.PASSWORD]: ''
    }

    function onRegister(formState) {
        setSuccessMessage(null); // Clear previous success msg
        try {
            sendRequest(
                {
                    requestCb: () => {
                        return register(
                            {
                                email: formState[REGISTER_FORM_FIELDS.EMAIL],
                                password: formState[REGISTER_FORM_FIELDS.PASSWORD],
                                name: formState[REGISTER_FORM_FIELDS.NAME]
                            }
                        )
                    }
                }
            )
        }
        catch (error) {
            console.log(error)
        }
    }

    const { handleChangeInput, onSubmit, formState } = useForm({ initialFormState, submitFn: onRegister })
    const navigate = useNavigate()

    useEffect(
        () => {
            if (error) {
                setErrorMessage(getFriendlyMessage(error));
            } else if (response) {
                if (response.ok) {
                    setSuccessMessage(getFriendlyMessage(response, 'Te has registrado exitosamente.'));
                    toast.success('¡Registro exitoso!', {
                        description: 'Te hemos enviado un correo de confirmación.'
                    });
                    setTimeout(() => {
                        navigate('/login')
                    }, 3000);
                } else {
                    setErrorMessage(getFriendlyMessage(response));
                }
            }
        },
        [response, error]
    )

    const [errorMessage, setErrorMessage] = useState(null)

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
                    <h1>Registrarse</h1>
                </div>

                <Alert type="success" message={successMessage} />
                <Alert type="error" message={errorMessage} />

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <label htmlFor="name">Nombre</label>
                        <input 
                            type="text" 
                            id="name" 
                            name={REGISTER_FORM_FIELDS.NAME} 
                            onChange={handleChangeInput} 
                            value={formState[REGISTER_FORM_FIELDS.NAME]} 
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name={REGISTER_FORM_FIELDS.EMAIL} 
                            onChange={handleChangeInput} 
                            value={formState[REGISTER_FORM_FIELDS.EMAIL]} 
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            name={REGISTER_FORM_FIELDS.PASSWORD} 
                            onChange={handleChangeInput} 
                            value={formState[REGISTER_FORM_FIELDS.PASSWORD]} 
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Cargando...' : 'Crear cuenta'}
                    </button>
                </form>
                <div className="auth-links">
                    <span>¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></span>
                </div>
            </div>
        </div>
    )
}

export default RegisterScreen