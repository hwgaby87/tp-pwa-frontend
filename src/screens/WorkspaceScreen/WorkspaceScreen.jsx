import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AuthContext } from '../../context/AuthContext';
import { getMessages, sendMessage, deleteMessage } from '../../services/messageService';
import { getWorkspaceById, updateWorkspace, uploadWorkspaceImage, deleteWorkspaceImage } from '../../services/workspaceService';
import { getChannels, updateChannel } from '../../services/channelService';
import { getDirectMessages, sendDirectMessage, deleteDirectMessage } from '../../services/directMessageService';
import { Sidebar, Loader } from '../../components';
import { toast } from 'sonner';
import { getFriendlyMessage } from '../../utils/messageHandler';
import './WorkspaceScreen.css';

/**
 * Formatea una cadena de fecha a formato de hora (HH:MM).
 * @param {string} dateString - Cadena de fecha.
 * @returns {string} Hora formateada.
 */
const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

/**
 * Genera un texto amigable para el separador de fechas (Hoy, Ayer o la fecha completa).
 * @param {string} dateString - Cadena de fecha.
 * @returns {string} Texto del separador.
 */
const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    } else {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
};


/**
 * Genera un color consistente basado en el ID del usuario para los avatares.
 * @param {string|number} userId - ID del usuario.
 * @returns {string} Código de color hexadecimal.
 */
const getUserColor = (userId) => {
    const colors = [
        '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', 
        '#2196F3', '#03A9F4', '#00BCD4', '#009688', 
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', 
        '#FF9800', '#FF5722', '#795548', '#607D8B'
    ];
    // Hash simple para generar un índice basado en IDs de texto o números
    const id = typeof userId === 'number' ? userId : 
               (userId ? userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0);
    return colors[id % colors.length];
};

const MessageStatus = ({ status, isMe, isDM }) => {
    if (!isMe || !isDM) return null;
    
    return (
        <span className={`message-status-ticks ${status}`}>
            {status === 'enviado' ? '✓' : '✓✓'}
        </span>
    );
};

/**
 * Componente de pantalla del Espacio de Trabajo (Workspace).
 * Gestiona la carga de mensajes, información del canal/miembro y la edición del espacio.
 * 
 * @component
 */
const WorkspaceScreen = () => {
    const { user } = useContext(AuthContext);
    const { workspace_id, channel_id, member_id } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [channelInfo, setChannelInfo] = useState(null);
    const [dmMemberInfo, setDmMemberInfo] = useState(null);
    const [workspaceInfo, setWorkspaceInfo] = useState(null);
    
    const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
    const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
    const [editingWorkspaceDescription, setEditingWorkspaceDescription] = useState('');
    const [isEditingChannel, setIsEditingChannel] = useState(false);
    const [editingChannelName, setEditingChannelName] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const workspaceImageRef = useRef(null);

    const handleWorkspaceImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const loadingToast = toast.loading('Subiendo imagen del espacio...');
        try {
            const response = await uploadWorkspaceImage(workspace_id, file);
            if (response.ok) {
                toast.success('Imagen del espacio actualizada', { id: loadingToast });
                loadWorkspaceInfo(workspace_id);
                window.dispatchEvent(new Event('workspaceUpdated'));
            } else {
                toast.error(response.message || 'Error al subir la imagen', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Error al subir la imagen', { id: loadingToast });
        }
    };

    const handleWorkspaceImageDelete = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar la imagen de este espacio?')) return;

        const loadingToast = toast.loading('Eliminando imagen...');
        try {
            const response = await deleteWorkspaceImage(workspace_id);
            if (response.ok) {
                toast.success('Imagen eliminada', { id: loadingToast });
                loadWorkspaceInfo(workspace_id);
                window.dispatchEvent(new Event('workspaceUpdated'));
            } else {
                toast.error(response.message || 'Error al eliminar la imagen', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Error al eliminar la imagen', { id: loadingToast });
        }
    };

    useEffect(() => {
        if (workspace_id) {
            loadWorkspaceInfo(workspace_id);
        }
        if (channel_id) {
            loadMessages(channel_id, 'channel');
            loadChannelInfo(channel_id);
            setDmMemberInfo(null);
        } else if (member_id) {
            loadMessages(member_id, 'dm');
            loadDmMemberInfo(member_id);
            setChannelInfo(null);
        } else {
            setMessages([]);
            setChannelInfo(null);
            setDmMemberInfo(null);
        }

        const handleSync = () => {
            if (workspace_id) loadWorkspaceInfo(workspace_id);
        };

        window.addEventListener('workspaceUpdated', handleSync);
        return () => window.removeEventListener('workspaceUpdated', handleSync);
    }, [workspace_id, channel_id, member_id]);

    useEffect(() => {
        // Cerrar la barra lateral al navegar en dispositivos móviles
        setIsSidebarOpen(false);
    }, [channel_id, member_id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        let interval;
        if (channel_id || member_id) {
            // La carga inicial ya está gestionada por el otro useEffect
            interval = setInterval(() => {
                const id = channel_id || member_id;
                const type = channel_id ? 'channel' : 'dm';
                loadMessages(id, type, true);
            }, 3000); // 3 segundos para una mejor capacidad de respuesta
        }

        const handleFocus = () => {
            const id = channel_id || member_id;
            const type = channel_id ? 'channel' : 'dm';
            if (id) loadMessages(id, type, true);
        };

        window.addEventListener('focus', handleFocus);
        
        return () => {
            if (interval) clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [workspace_id, channel_id, member_id]);

    /**
     * Carga los mensajes de un canal o chat directo.
     * @param {string} id - ID del canal o miembro.
     * @param {string} type - Tipo de mensaje ('channel' o 'dm').
     * @param {boolean} isSilent - Si es true, no muestra el cargador (útil para polling).
     */
    const loadMessages = async (id, type, isSilent = false) => {
        if (!isSilent) setLoadingMessages(true);
        try {
            const response = type === 'channel' 
                ? await getMessages(workspace_id, id)
                : await getDirectMessages(workspace_id, id);
            
            if (response.ok) {
                // Los DMs del backend a veces usan nombres de campo diferentes, vamos a normalizarlos
                const normalized = response.data.map(msg => ({
                    channel_message_id: msg.message_id || msg.channel_message_id,
                    channel_message_created_at: msg.created_at || msg.channel_message_created_at,
                    content: msg.content || msg.channel_message_content,
                    user_id: msg.user_id,
                    user_name: msg.user_name,
                    status: msg.status || 'enviado'
                }));
                
                // Evitar actualizaciones de estado innecesarias si los mensajes son idénticos
                setMessages(prev => {
                    const isIdentical = JSON.stringify(prev) === JSON.stringify(normalized);
                    return isIdentical ? prev : normalized;
                });

                // Marcar mensajes no leídos como leídos (para DMs)
                if (type === 'dm') {
                    const unread = normalized.filter(m => m.user_id !== user?.id && m.status !== 'leído');
                    if (unread.length > 0) {
                        const { markDirectMessageAsRead } = await import('../../services/directMessageService');
                        Promise.all(unread.map(m => markDirectMessageAsRead(workspace_id, m.channel_message_id)))
                            .catch(err => console.error("Error marking as read", err));
                        
                        // Actualizar el estado local de forma optimista
                        setMessages(prev => prev.map(msg => 
                            (msg.user_id !== user?.id && msg.status !== 'leído') ? { ...msg, status: 'leído' } : msg
                        ));
                    }
                }
            }
        } catch (error) {
            if (!isSilent) console.error("Error loading messages", error);
        } finally {
            if (!isSilent) setLoadingMessages(false);
        }
    };

    const loadWorkspaceInfo = async (id) => {
        try {
            const response = await getWorkspaceById(id);
            if (response.ok) {
                // El backend devuelve { ok: true, data: { workspace: {...}, members: [...] } }
                const workspace = response.data.workspace;
                setWorkspaceInfo(workspace);
                setEditingWorkspaceName(workspace.title);
                setEditingWorkspaceDescription(workspace.description || '');
            }
        } catch (error) {
            console.error("Error loading workspace info", error);
        }
    };

    const loadChannelInfo = async (id) => {
        try {
            const response = await getChannels(workspace_id);
            if (response.ok) {
                const currentChannel = response.data.find(c => c.channel_id.toString() === id.toString());
                setChannelInfo(currentChannel);
                if (currentChannel) setEditingChannelName(currentChannel.channel_name);
            }
        } catch (error) {
            console.error("Error loading channel info", error);
        }
    };

    const loadDmMemberInfo = async (id) => {
        try {
            const response = await getWorkspaceById(workspace_id);
            if (response.ok) {
                const members = response.data.members || [];
                const partner = members.find(m => m.member_id.toString() === id.toString());
                setDmMemberInfo(partner);
            }
        } catch (error) {
            console.error("Error loading DM member info", error);
        }
    };

    const handleUpdateWorkspace = async (e) => {
        e.preventDefault();
        if (!editingWorkspaceName.trim()) return;
        try {
            const response = await updateWorkspace(workspace_id, editingWorkspaceName, editingWorkspaceDescription);
            if (response.ok) {
                setIsEditingWorkspace(false);
                loadWorkspaceInfo(workspace_id);
                window.dispatchEvent(new Event('workspaceUpdated'));
                toast.success('Espacio de trabajo actualizado');
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error updating workspace", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleUpdateChannelName = async (e) => {
        e.preventDefault();
        if (!editingChannelName.trim()) return;
        try {
            const response = await updateChannel(workspace_id, channel_id, editingChannelName);
            if (response.ok) {
                setIsEditingChannel(false);
                loadChannelInfo(channel_id);
                toast.success('Canal actualizado');
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error updating channel", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const contentToSend = newMessage;
        const tempId = 'temp-' + Date.now();
        const optimisticMsg = {
            channel_message_id: tempId,
            channel_message_created_at: new Date().toISOString(),
            content: contentToSend,
            user_id: user?.id || user?._id,
            user_name: user?.name,
            status: 'enviado',
            isOptimistic: true
        };

        // Actualización optimista: mostramos el mensaje antes de que llegue al servidor
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');

        try {
            const response = channel_id 
                ? await sendMessage(workspace_id, channel_id, contentToSend)
                : await sendDirectMessage(workspace_id, member_id, contentToSend);

            if (response.ok) {
                // Refrescar mensajes silenciosamente para reemplazar el optimista con datos reales
                if (channel_id) {
                    loadMessages(channel_id, 'channel', true);
                } else {
                    loadMessages(member_id, 'dm', true);
                }
            } else {
                // Revertir la actualización optimista en caso de error
                setMessages(prev => prev.filter(m => m.channel_message_id !== tempId));
                setNewMessage(contentToSend); // Restaurar el texto en el input
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error sending message", error);
            setMessages(prev => prev.filter(m => m.channel_message_id !== tempId));
            setNewMessage(contentToSend); // Restore text
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleDeleteMessage = async (message_id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este mensaje?')) return;
        
        try {
            const response = channel_id 
                ? await deleteMessage(workspace_id, channel_id, message_id)
                : await deleteDirectMessage(workspace_id, message_id);

            if (response.ok) {
                toast.success('Mensaje eliminado');
                channel_id ? loadMessages(channel_id, 'channel') : loadMessages(member_id, 'dm');
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error deleting message", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    return (
        <div className={`workspace-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
            <main className="workspace-main-content">
                <div className="workspace-global-header">
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Abrir menú"
                    >
                        ☰
                    </button>
                    <div className="workspace-breadcrumb">
                                    {isEditingWorkspace ? (
                                        <form onSubmit={handleUpdateWorkspace} className="header-edit-form workspace-edit-popover">
                                            <div className="popover-content">
                                                <label>Nombre del Espacio</label>
                                                <input 
                                                    value={editingWorkspaceName}
                                                    onChange={(e) => setEditingWorkspaceName(e.target.value)}
                                                    autoFocus
                                                    required
                                                />
                                                <label>Imagen del Espacio</label>
                                                <div className="workspace-image-edit">
                                                    <div className="ws-image-preview">
                                                        {workspaceInfo?.url_image ? (
                                                            <img src={workspaceInfo.url_image} alt="Workspace" />
                                                        ) : (
                                                            <div className="ws-image-placeholder">
                                                                {workspaceInfo?.title?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ws-image-actions">
                                                        <button 
                                                            type="button" 
                                                            className="btn-sm btn-primary"
                                                            onClick={() => workspaceImageRef.current?.click()}
                                                        >
                                                            Cambiar
                                                        </button>
                                                        {workspaceInfo?.url_image && !workspaceInfo.url_image.includes('ui-avatars.com') && (
                                                            <button 
                                                                type="button" 
                                                                className="btn-sm btn-ghost-red"
                                                                onClick={handleWorkspaceImageDelete}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        )}
                                                        <input 
                                                            ref={workspaceImageRef}
                                                            type="file"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            onChange={handleWorkspaceImageUpload}
                                                        />
                                                    </div>
                                                </div>
                                                <label>Descripción</label>
                                                <textarea 
                                                    value={editingWorkspaceDescription}
                                                    onChange={(e) => setEditingWorkspaceDescription(e.target.value)}
                                                    placeholder="¿De qué trata este espacio?"
                                                />
                                                <div className="popover-actions">
                                                    <button type="submit" className="save-btn">Guardar</button>
                                                    <button type="button" onClick={() => setIsEditingWorkspace(false)} className="cancel-btn">Cancelar</button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="ws-title-container" onClick={() => setIsEditingWorkspace(true)}>
                                            <span className="ws-breadcrumb-name">
                                                {workspaceInfo?.title || 'Espacio de Trabajo'}
                                            </span>
                                            {workspaceInfo?.description && (
                                                <span className="ws-description-tag" title={workspaceInfo.description}>
                                                    ⓘ
                                                </span>
                                            )}
                                            <span className="edit-icon-hint">✏️</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {channel_id || member_id ? (
                                <>
                                    {channel_id ? (
                                        <div className="channel-header-container">
                                            <div className="channel-info-row">
                                    {isEditingChannel ? (
                                        <form onSubmit={handleUpdateChannelName} className="header-edit-form channel-edit-form">
                                            <input 
                                                value={editingChannelName}
                                                onChange={(e) => setEditingChannelName(e.target.value)}
                                                autoFocus
                                                onBlur={() => setIsEditingChannel(false)}
                                            />
                                        </form>
                                    ) : (
                                        <h2 onClick={() => setIsEditingChannel(true)}>
                                            # {channelInfo ? channelInfo.channel_name : 'Cargando...'}
                                            <span className="edit-icon-hint">✏️</span>
                                        </h2>
                                    )}
                                    
                                    {channelInfo?.channel_description && channelInfo.channel_description !== 'Nuevo canal' && (
                                        <p className="channel-desc">{channelInfo.channel_description}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="channel-header-container dm-header">
                                <button 
                                    className="mobile-menu-btn" 
                                    onClick={() => setIsSidebarOpen(true)}
                                    aria-label="Abrir menú"
                                >
                                    ☰
                                </button>
                                <div className="workspace-breadcrumb">
                                    <span className="ws-breadcrumb-name">
                                        {workspaceInfo?.title || 'Espacio de Trabajo'}
                                    </span>
                                    <span className="breadcrumb-separator">/</span>
                                </div>
                                <div className="channel-info-row">
                                    <div className="partner-avatar" style={{ backgroundColor: getUserColor(dmMemberInfo?.user_id) }}>
                                        {dmMemberInfo?.user_name?.substring(0, 1).toUpperCase() || '@'}
                                    </div>
                                    <h2>{dmMemberInfo?.user_name || 'Cargando...'}</h2>
                                    <span className="member-status-dot online"></span>
                                </div>
                            </div>
                        )}
                        
                        <div className="messages-area">
                            {loadingMessages ? (
                                <div className="loader-wrapper">
                                    <Loader size="large" />
                                    <p className="loading-text">Cargando tus mensajes...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="no-messages-container">
                                    <div className="empty-chat-icon">💬</div>
                                    <p className="no-messages">
                                        {channel_id 
                                            ? "No hay mensajes en este canal. ¡Sé el primero en saludar!"
                                            : `Este es el comienzo de tu conversación con ${dmMemberInfo?.user_name || 'este usuario'}`
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="messages-list">
                                    {messages.map((msg, index) => {
                                        const msgDate = new Date(msg.channel_message_created_at).toDateString();
                                        const prevMsgDate = index > 0 ? new Date(messages[index - 1].channel_message_created_at).toDateString() : null;
                                        const showSeparator = msgDate !== prevMsgDate;

                                        return (
                                            <React.Fragment key={msg.channel_message_id}>
                                                {showSeparator && (
                                                    <div className="date-separator">
                                                        <div className="separator-line"></div>
                                                        <span className="separator-text">{formatDateSeparator(msg.channel_message_created_at)}</span>
                                                        <div className="separator-line"></div>
                                                    </div>
                                                )}
                                                <div className={`message-bubble-wrapper ${msg.user_id === user?.id ? 'is-me' : 'is-other'}`}>
                                                    {!member_id && msg.user_id !== user?.id && (
                                                        <div 
                                                            className="msg-avatar-small"
                                                            style={{ backgroundColor: getUserColor(msg.user_id) }}
                                                        >
                                                            {msg.user_name?.substring(0, 1).toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                    <div className="message-bubble">
                                                        {channel_id && msg.user_id !== user?.id && (
                                                            <span 
                                                                className="bubble-sender-name"
                                                                style={{ color: getUserColor(msg.user_id) }}
                                                            >
                                                                {msg.user_name || `Usuario ${msg.user_id}`}
                                                            </span>
                                                        )}
                                                        <div className="bubble-content">
                                                            {msg.content}
                                                        </div>
                                                        <div className="bubble-meta">
                                                            <span className="bubble-time">{formatTime(msg.channel_message_created_at)}</span>
                                                            <MessageStatus status={msg.status} isMe={msg.user_id === user?.id} isDM={!!member_id} />
                                                            {msg.user_id === user?.id && (
                                                                <button 
                                                                    className="bubble-delete-btn" 
                                                                    onClick={() => handleDeleteMessage(msg.channel_message_id)}
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                        
                        <div className="message-input-container">
                            <form className="message-form" onSubmit={handleSendMessage}>
                                <input 
                                    type="text" 
                                    placeholder={channel_id 
                                        ? `Mensaje a #${channelInfo?.channel_name || 'canal'}`
                                        : `Mensaje a ${dmMemberInfo?.user_name || 'usuario'}`
                                    } 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="send-btn">
                                    <span>➤</span>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="no-channel-selected">
                        <button 
                            className="mobile-menu-btn absolute" 
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Abrir menú"
                        >
                            ☰
                        </button>
                        <div className="select-icon-container">
                            <span className="floating-icon">💬</span>
                        </div>
                        <h2>{workspaceInfo?.title ? `Bienvenido a ${workspaceInfo.title}` : 'Selecciona un canal'}</h2>
                        {workspaceInfo?.description && (
                            <p className="ws-welcome-desc">{workspaceInfo.description}</p>
                        )}
                        <p>Elige un canal o un miembro de la lista de la izquierda para comenzar a chatear con tu equipo.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WorkspaceScreen;
