import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resetPassword } from '../../services/authService'
import { Alert } from '../../components'
import { getFriendlyMessage } from '../../utils/messageHandler'
import { toast } from 'sonner'

const ResetPasswordScreen = () => {
  const { reset_password_token } = useParams()
  const {
    sendRequest,
    response,
    error,
    loading
  } = useRequest()

  const FORM_FIELDS = {
    PASSWORD: 'password',
    CONFIRM_PASSWORD: 'confirm_password'
  }
  const initalFormState = {
    [FORM_FIELDS.PASSWORD]: '',
    [FORM_FIELDS.CONFIRM_PASSWORD]: ''
  }

  function submitResetPassword() {
    if (formState[FORM_FIELDS.PASSWORD] !== formState[FORM_FIELDS.CONFIRM_PASSWORD]) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    sendRequest(
      {
        requestCb: async () => {
          return await resetPassword({ 
            password: formState[FORM_FIELDS.PASSWORD], 
            reset_password_token 
          })
        }
      }
    )
  }

  const {
    handleChangeInput,
    onSubmit,
    formState
  } = useForm({
    initialFormState: initalFormState,
    submitFn: submitResetPassword
  })

  let errorMessage = null;
  let successMessage = null;

  if (error) {
    errorMessage = getFriendlyMessage(error);
  } else if (response) {
    if (!response.ok) {
      errorMessage = getFriendlyMessage(response);
    } else {
      successMessage = getFriendlyMessage(response, "Contraseña actualizada correctamente.");
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
            <h1>Nueva contraseña</h1>
        </div>

        {
          successMessage ?
            <div style={{ textAlign: 'center' }}>
              <Alert type="success" message={successMessage} />
              <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'block', marginTop: '1.5rem' }}>Iniciar sesión</Link>
            </div>
            :
            <>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Ingresa tu nueva contraseña a continuación.
              </p>
              
              <Alert type="error" message={errorMessage} />

              <form onSubmit={onSubmit}>
                <div className="input-group">
                  <label htmlFor="password">Nueva contraseña</label>
                  <input
                    type="password"
                    name={FORM_FIELDS.PASSWORD}
                    id="password"
                    onChange={handleChangeInput}
                    value={formState[FORM_FIELDS.PASSWORD]}
                    placeholder="********"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="confirm_password">Confirmar contraseña</label>
                  <input
                    type="password"
                    name={FORM_FIELDS.CONFIRM_PASSWORD}
                    id="confirm_password"
                    onChange={handleChangeInput}
                    value={formState[FORM_FIELDS.CONFIRM_PASSWORD]}
                    placeholder="********"
                    required
                  />
                </div>
                <button type='submit' className="auth-btn" disabled={loading}>
                  {loading ? 'Cargando...' : 'Cambiar contraseña'}
                </button>
              </form>
            </>
        }
      </div>
    </div>
  )
}

export default ResetPasswordScreen
