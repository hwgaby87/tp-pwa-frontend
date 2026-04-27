import React, { useEffect } from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resetPasswordRequest } from '../../services/authService'
import Alert from '../../components/Alert/Alert'
import { getFriendlyMessage } from '../../utils/messageHandler'

const ResetPasswordRequestScreen = () => {

  const {
    sendRequest,
    response,
    error,
    loading
  } = useRequest()

  /* Hacer un formulario donde se solcite el email, este email sera usado para saber a quien debemos mandar el mail para restablecer la contraseña */
  const FORM_FIELDS = {
    EMAIL: 'email'
  }
  const initalFormState = {
    [FORM_FIELDS.EMAIL]: ''
  }

  function submitResetPasswordRequest() {
    sendRequest(
      {
        requestCb: async () => {
          return await resetPasswordRequest({ email: formState[FORM_FIELDS.EMAIL] })
        }
      }
    )
  }

  const {
    handleChangeInput,
    onSubmit,
    formState,
    resetForm
  } = useForm({
    initialFormState: initalFormState,
    submitFn: submitResetPasswordRequest
  })

  let errorMessage = null;
  let successMessage = null;

  if (error) {
    errorMessage = getFriendlyMessage(error);
  } else if (response) {
    if (!response.ok) {
      errorMessage = getFriendlyMessage(response);
    } else {
      successMessage = getFriendlyMessage(response, "Se ha enviado un correo con instrucciones.");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="back-link">
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
            <h1>Restablecer contraseña</h1>
        </div>

        {
          successMessage ?
            <Alert type="success" message={successMessage} />
            :
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Se enviará un mail con instrucciones para que puedas restablecer tu contraseña.
              </p>

              <Alert type="error" message={errorMessage} />

              <form onSubmit={onSubmit}>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name={FORM_FIELDS.EMAIL}
                    id="email"
                    onChange={handleChangeInput}
                    value={formState[FORM_FIELDS.EMAIL]}
                    placeholder="ejemplo@correo.com"
                    required
                  />
                </div>
                <button type='submit' className="auth-btn" disabled={loading}>
                  {loading ? 'Cargando...' : 'Enviar solicitud'}
                </button>
              </form>
              <div className="auth-links">
                <span>¿Recuerdas tu contraseña? <Link to={'/login'}>Iniciar sesión</Link></span>
                <span>¿No tienes una cuenta? <Link to="/register">Registrarse</Link></span>
              </div>
            </>
        }
      </div>
    </div>
  )
}

export default ResetPasswordRequestScreen