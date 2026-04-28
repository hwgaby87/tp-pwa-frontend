import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';
import ENVIRONMENT from '../../config/environment';
import './InvitationScreen.css';

const InvitationScreen = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Estamos procesando tu respuesta...');
    const [workspaceId, setWorkspaceId] = useState(null);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('El enlace de invitación no es válido o ha expirado.');
            return;
        }

        const respondToInvitation = async () => {
            try {
                const response = await fetch(`${ENVIRONMENT.API_URL}/api/workspaces/respond-invitation?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    const isAccepted = data.data?.workspace_member_accept_invitation === 'accepted';
                    setMessage(isAccepted 
                        ? '¡Excelente! Has aceptado la invitación y ya puedes empezar a colaborar.' 
                        : 'Has rechazado la invitación correctamente.');
                    
                    setWorkspaceId(data.data?.workspace_id);
                    toast.success(isAccepted ? 'Invitación aceptada' : 'Invitación rechazada');
                    
                    // Sync other tabs
                    localStorage.setItem('workspace_sync', Date.now());
                    window.dispatchEvent(new Event('workspaceUpdated'));
                    
                    // Redirect after a few seconds if workspaceId is available
                    if (data.data?.workspace_id) {
                        setTimeout(() => {
                            navigate(`/workspace/${data.data.workspace_id}`);
                        }, 3000);
                    }
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Hubo un error al procesar la invitación.');
                    toast.error(data.message || 'Error en la invitación');
                }
            } catch (error) {
                console.error("Error responding to invitation:", error);
                setStatus('error');
                setMessage('No se pudo conectar con el servidor.');
                toast.error('Error de conexión');
            }
        };

        respondToInvitation();
    }, [token, navigate]);

    return (
        <div className="invitation-page">
            <div className="invitation-card">
                <div className="card-header">
                    <div className="app-logo">C</div>
                    <h1>Conecta</h1>
                </div>
                
                <div className={`status-icon ${status}`}>
                    {status === 'processing' && <div className="spinner"></div>}
                    {status === 'success' && <span className="icon">✓</span>}
                    {status === 'error' && <span className="icon">✕</span>}
                </div>

                <div className="card-body">
                    <h2>Respuesta a la Invitación</h2>
                    <p className="message-text">{message}</p>
                </div>

                <div className="card-footer">
                    {status === 'success' && (
                        <button className="primary-btn" onClick={() => navigate(workspaceId ? `/workspace/${workspaceId}` : '/home')}>
                            {workspaceId ? 'Ir al Espacio de Trabajo' : 'Ir al Inicio'}
                        </button>
                    )}
                    {status === 'error' && (
                        <button className="secondary-btn" onClick={() => navigate('/login')}>
                            Volver al Inicio de Sesión
                        </button>
                    )}
                    {status === 'processing' && <p className="hint">Espera un momento...</p>}
                </div>
            </div>
        </div>
    );
};

export default InvitationScreen;
