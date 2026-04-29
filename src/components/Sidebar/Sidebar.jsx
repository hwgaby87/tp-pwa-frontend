import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { createWorkspace, getWorkspaces, updateWorkspace, deleteWorkspace, restoreWorkspace, uploadWorkspaceImage, deleteWorkspaceImage } from '../../services/workspaceService';
import { getChannels, createChannel, updateChannel, deleteChannel, restoreChannel, getDeletedChannels } from '../../services/channelService';
import { AuthContext } from '../../context/AuthContext';
import ENVIRONMENT from '../../config/environment';
import { ThemeToggle, ConfirmModal, ProfileModal } from '..';
import { toast } from 'sonner';
import { getFriendlyMessage } from '../../utils/messageHandler';
import './Sidebar.css';


/**
 * Componente de barra lateral que gestiona la navegación entre espacios de trabajo,
 * canales y mensajes directos. También permite la gestión de los mismos.
 * 
 * @component
 */
const Sidebar = () => {
    const navigate = useNavigate();
    const { workspace_id, channel_id, member_id: dm_member_id } = useParams();
    const { user, logout, setUser, updateToken } = useContext(AuthContext);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [workspaces, setWorkspaces] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(false);

    const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');

    const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
    const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
    const [editingWorkspaceDescription, setEditingWorkspaceDescription] = useState('');

    const [showNewChannelForm, setShowNewChannelForm] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');

    const [editingChannelId, setEditingChannelId] = useState(null);
    const [editingChannelName, setEditingChannelName] = useState('');

    const [deletedChannels, setDeletedChannels] = useState([]);
    const [showDeletedChannels, setShowDeletedChannels] = useState(false);
    const [loadingDeletedChannels, setLoadingDeletedChannels] = useState(false);

    const [showInviteMemberForm, setShowInviteMemberForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [editingMemberRoleId, setEditingMemberRoleId] = useState(null);
    const [showArchivedWorkspaces, setShowArchivedWorkspaces] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'danger'
    });

    const workspaceImageRef = useRef(null);

    const handleWorkspaceImageUpload = async (e, wsId) => {
        const file = e.target.files[0];
        if (!file) return;

        const loadingToast = toast.loading('Subiendo imagen del espacio...');
        try {
            const response = await uploadWorkspaceImage(wsId, file);
            if (response.ok) {
                toast.success('Imagen del espacio actualizada', { id: loadingToast });
                loadWorkspaces();
            } else {
                toast.error(response.message || 'Error al subir la imagen', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Error al subir la imagen', { id: loadingToast });
        }
    };

    const handleWorkspaceImageDelete = async (wsId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar la imagen de este espacio?')) return;

        const loadingToast = toast.loading('Eliminando imagen...');
        try {
            const response = await deleteWorkspaceImage(wsId);
            if (response.ok) {
                toast.success('Imagen eliminada', { id: loadingToast });
                loadWorkspaces();
            } else {
                toast.error(response.message || 'Error al eliminar la imagen', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Error al eliminar la imagen', { id: loadingToast });
        }
    };

    const [unreadChannels, setUnreadChannels] = useState(() => {
        const saved = localStorage.getItem('unread_channels');
        return saved ? JSON.parse(saved) : {};
    });

    const [unreadDMs, setUnreadDMs] = useState(() => {
        const saved = localStorage.getItem('unread_dms');
        return saved ? JSON.parse(saved) : {};
    });

    const activeWorkspaces = workspaces.filter(ws => ws.workspace_active !== false);
    const archivedWorkspaces = workspaces.filter(ws => 
        ws.workspace_active === false && ws.member_role === 'owner'
    );

    const selectedWorkspace = workspaces.find(w => w.workspace_id.toString() === workspace_id);

    useEffect(() => {
        loadWorkspaces();

        const handleWorkspaceSync = () => {
            loadWorkspaces();
            if (workspace_id) {
                loadChannels(workspace_id);
                loadMembers(workspace_id);
            }
        };

        const handleStorageChange = (e) => {
            if (e.key === 'workspace_sync') {
                handleWorkspaceSync();
            }
        };

        window.addEventListener('workspaceUpdated', handleWorkspaceSync);
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('workspaceUpdated', handleWorkspaceSync);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [workspace_id]);

    useEffect(() => {
        if (workspace_id) {
            loadChannels(workspace_id);
            loadMembers(workspace_id);
        } else {
            setChannels([]);
            setMembers([]);
            setShowInviteMemberForm(false);
            setEditingChannelId(null);
        }
    }, [workspace_id]);

    // Lógica para marcar canales como leídos al entrar
    useEffect(() => {
        if (channel_id) {
            setUnreadChannels(prev => {
                const newState = { ...prev };
                delete newState[channel_id];
                localStorage.setItem('unread_channels', JSON.stringify(newState));
                return newState;
            });
        }
        if (dm_member_id) {
            setUnreadDMs(prev => {
                const newState = { ...prev };
                delete newState[dm_member_id];
                localStorage.setItem('unread_dms', JSON.stringify(newState));
                return newState;
            });
        }
    }, [channel_id, dm_member_id]);

    // Escuchar nuevos mensajes para marcar como no leídos
    useEffect(() => {
        const handleNewMessage = (e) => {
            const { channelId, senderId, workspaceId: msgWsId } = e.detail;
            
            // Solo si es del workspace actual
            if (msgWsId !== workspace_id) return;

            if (channelId && channelId !== channel_id) {
                setUnreadChannels(prev => {
                    const newState = { ...prev, [channelId]: true };
                    localStorage.setItem('unread_channels', JSON.stringify(newState));
                    return newState;
                });
            } else if (senderId && senderId !== dm_member_id && senderId !== user?.id) {
                setUnreadDMs(prev => {
                    const newState = { ...prev, [senderId]: true };
                    localStorage.setItem('unread_dms', JSON.stringify(newState));
                    return newState;
                });
            }
        };

        window.addEventListener('newMessageReceived', handleNewMessage);
        return () => window.removeEventListener('newMessageReceived', handleNewMessage);
    }, [workspace_id, channel_id, dm_member_id, user?.id]);

    const loadWorkspaces = async () => {
        setLoadingWorkspaces(true);
        try {
            const response = await getWorkspaces();
            if (response.ok) {
                setWorkspaces(response.data.workspaces || []);
            }
        } catch (error) {
            console.error("Error loading workspaces", error);
        } finally {
            setLoadingWorkspaces(false);
        }
    };

    const loadChannels = async (id) => {
        setLoadingChannels(true);
        try {
            const response = await getChannels(id);
            if (response.ok) {
                setChannels(response.data || []);
            }
        } catch (error) {
            console.error("Error loading channels", error);
        } finally {
            setLoadingChannels(false);
        }
    };

    const loadMembers = async (id) => {
        setLoadingMembers(true);
        try {
            const { getMembers } = await import('../../services/memberService');
            const response = await getMembers(id);
            if (response.ok) {
                setMembers(response.data || []);
            }
        } catch (error) {
            console.error("Error loading members", error);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        try {
            const response = await createWorkspace(newWorkspaceName, newWorkspaceDescription);
            if (response.ok) {
                setNewWorkspaceName('');
                setNewWorkspaceDescription('');
                setShowNewWorkspaceForm(false);
                loadWorkspaces();
                window.dispatchEvent(new Event('workspaceUpdated'));
                toast.success('Espacio de trabajo creado');
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error creating workspace", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleUpdateWorkspace = async (e) => {
        e.preventDefault();
        if (!editingWorkspaceName.trim() || !editingWorkspaceId) return;
        try {
            const response = await updateWorkspace(editingWorkspaceId, editingWorkspaceName, editingWorkspaceDescription);
            if (response.ok) {
                setEditingWorkspaceId(null);
                setEditingWorkspaceName('');
                setEditingWorkspaceDescription('');
                loadWorkspaces();
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

    const handleCreateChannel = async (e) => {
        e.preventDefault();
        if (!newChannelName.trim() || !workspace_id) return;
        try {
            const response = await createChannel(workspace_id, newChannelName, '');
            if (response.ok) {
                setNewChannelName('');
                setShowNewChannelForm(false);
                loadChannels(workspace_id);
                toast.success('Canal creado');
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error creating channel", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleUpdateChannel = async (e) => {
        e.preventDefault();
        if (!editingChannelName.trim() || !editingChannelId) return;
        try {
            const response = await updateChannel(workspace_id, editingChannelId, editingChannelName);
            if (response.ok) {
                setEditingChannelId(null);
                setEditingChannelName('');
                loadChannels(workspace_id);
                toast.success('Canal actualizado');
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error updating channel", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleRestoreChannel = async (id) => {
        try {
            const response = await restoreChannel(workspace_id, id);
            if (response.ok) {
                toast.success('Canal restaurado');
                loadChannels(workspace_id);
                loadDeletedChannels(workspace_id);
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error restoring channel", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const loadDeletedChannels = async (id) => {
        setLoadingDeletedChannels(true);
        try {
            const response = await getDeletedChannels(id);
            if (response.ok) {
                setDeletedChannels(response.data || []);
            }
        } catch (error) {
            console.error("Error loading deleted channels", error);
        } finally {
            setLoadingDeletedChannels(false);
        }
    };

    const toggleDeletedChannels = () => {
        const nextState = !showDeletedChannels;
        setShowDeletedChannels(nextState);
        if (nextState && workspace_id) {
            loadDeletedChannels(workspace_id);
        }
    };

    const handleDeleteWorkspace = async (workspaceId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Archivar Espacio',
            message: '¿Estás seguro de que quieres archivar este espacio de trabajo? Podrás restaurarlo más tarde.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const response = await deleteWorkspace(workspaceId);
                    if (response.ok) {
                        loadWorkspaces();
                        toast.success('Espacio de trabajo archivado', {
                            action: {
                                label: 'Deshacer',
                                onClick: async () => {
                                    try {
                                        const restoreRes = await restoreWorkspace(workspaceId);
                                        if (restoreRes.ok) {
                                            loadWorkspaces();
                                            toast.success('Espacio de trabajo restaurado');
                                        }
                                    } catch (err) {
                                        toast.error('Error al restaurar');
                                    }
                                }
                            }
                        });
                        if (workspace_id === workspaceId.toString()) {
                            navigate('/home');
                        }
                    } else {
                        toast.error(getFriendlyMessage(response));
                    }
                } catch (error) {
                    console.error("Error deleting workspace", error);
                    toast.error(getFriendlyMessage(error));
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleRestoreWorkspace = async (workspaceId) => {
        try {
            const response = await restoreWorkspace(workspaceId);
            if (response.ok) {
                toast.success('Espacio de trabajo restaurado');
                loadWorkspaces();
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error restoring workspace", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleDeleteChannel = async (channelId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Archivar Canal',
            message: '¿Estás seguro de que quieres archivar este canal? Podrás restaurarlo más tarde.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const response = await deleteChannel(workspace_id, channelId);
                    if (response.ok) {
                        loadChannels(workspace_id);
                        toast.success('Canal archivado', {
                            action: {
                                label: 'Deshacer',
                                onClick: async () => {
                                    try {
                                        const restoreRes = await restoreChannel(workspace_id, channelId);
                                        if (restoreRes.ok) {
                                            loadChannels(workspace_id);
                                            toast.success('Canal restaurado');
                                        }
                                    } catch (err) {
                                        toast.error('Error al restaurar');
                                    }
                                }
                            }
                        });
                    } else {
                        toast.error(getFriendlyMessage(response));
                    }
                } catch (error) {
                    console.error("Error deleting channel", error);
                    toast.error(getFriendlyMessage(error));
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleRemoveMember = async (memberId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Eliminar Miembro',
            message: '¿Estás seguro de que quieres eliminar a este miembro del espacio de trabajo?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const { removeMember } = await import('../../services/memberService');
                    const response = await removeMember(workspace_id, memberId);
                    if (response.ok) {
                        loadMembers(workspace_id);
                        toast.success('Miembro eliminado');
                    } else {
                        toast.error(getFriendlyMessage(response));
                    }
                } catch (error) {
                    console.error("Error removing member", error);
                    toast.error(getFriendlyMessage(error));
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim() || !workspace_id) return;
        try {
            const { inviteMember } = await import('../../services/memberService');
            const response = await inviteMember(workspace_id, inviteEmail);
            if (response.ok) {
                setInviteEmail('');
                setShowInviteMemberForm(false);
                toast.success('Invitación enviada con éxito');
                loadMembers(workspace_id);
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error inviting member", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const handleUpdateMemberRole = async (memberId, newRole) => {
        try {
            const { updateMemberRole } = await import('../../services/memberService');
            const response = await updateMemberRole(workspace_id, memberId, newRole);
            if (response.ok) {
                setEditingMemberRoleId(null);
                loadMembers(workspace_id);
                toast.success('Rol actualizado con éxito');
            } else {
                toast.error(getFriendlyMessage(response));
            }
        } catch (error) {
            console.error("Error updating member role", error);
            toast.error(getFriendlyMessage(error));
        }
    };

    const startEditingWorkspace = (ws) => {
        setEditingWorkspaceId(ws.workspace_id);
        setEditingWorkspaceName(ws.workspace_title);
        setEditingWorkspaceDescription(ws.workspace_description || '');
    };

    const startEditingChannel = (channel) => {
        setEditingChannelId(channel.channel_id);
        setEditingChannelName(channel.channel_name);
    };
    



    const currentUserMember = members.find(m => m.user_id === user?.id || m.user_id === user?._id);
    const currentUserRole = currentUserMember?.member_role;
    const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

    return (
        <aside className="app-sidebar">
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            {/* Sección de Espacios de Trabajo */}
            <div className="workspaces-column">
                <div className="column-header app-brand">
                    <h2 className="app-name">
                        <svg width="32" height="32" viewBox="0 0 100 100" className="brand-logo">
                            <rect width="100" height="100" rx="24" fill="var(--accent-color)"/>
                            <path d="M 65 35 A 20 20 0 1 0 65 65" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round"/>
                            <circle cx="65" cy="35" r="8" fill="#ffffff"/>
                            <circle cx="65" cy="65" r="8" fill="#ffffff"/>
                        </svg>
                        <span className="app-name-text">Conecta</span>
                    </h2>
                    <button
                        className="add-btn"
                        onClick={() => setShowNewWorkspaceForm(!showNewWorkspaceForm)}
                        title="Crear Espacio de Trabajo"
                    >
                        +
                    </button>
                </div>

                {showNewWorkspaceForm && (
                    <form className="sidebar-form" onSubmit={handleCreateWorkspace}>
                        <input
                            type="text"
                            placeholder="Nombre del espacio..."
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            autoFocus
                            required
                        />
                        <textarea
                            placeholder="Descripción (opcional)..."
                            value={newWorkspaceDescription}
                            onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                            className="sidebar-textarea"
                        />
                        <div className="form-actions">
                            <button type="submit">Crear</button>
                            <button type="button" onClick={() => setShowNewWorkspaceForm(false)}>X</button>
                        </div>
                    </form>
                )}

                <ul className="workspace-list">
                    <li>
                        <Link to="/home" className={!workspace_id ? 'active' : ''}>
                            <div className="ws-avatar home-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                            <span className="ws-name">Inicio</span>
                        </Link>
                    </li>
                    {loadingWorkspaces ? (
                        <li className="loading">Cargando...</li>
                    ) : (
                        <>
                            {activeWorkspaces.map(ws => (
                                <li key={ws.workspace_id} className={workspace_id === ws.workspace_id.toString() ? 'active' : ''}>
                                    {editingWorkspaceId === ws.workspace_id ? (
                                        <form className="edit-workspace-form" onSubmit={handleUpdateWorkspace}>
                                            <input
                                                value={editingWorkspaceName}
                                                onChange={(e) => setEditingWorkspaceName(e.target.value)}
                                                autoFocus
                                                placeholder="Nombre"
                                                required
                                            />
                                            <div className="sidebar-ws-image-edit">
                                                <div className="ws-image-preview-mini">
                                                    {ws.workspace_url_image ? (
                                                        <img src={ws.workspace_url_image} alt="WS" />
                                                    ) : (
                                                        <div className="ws-image-placeholder-mini">
                                                            {ws.workspace_title.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ws-image-btns-mini">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => workspaceImageRef.current?.click()}
                                                        title="Cambiar imagen"
                                                    >
                                                        📷
                                                    </button>
                                                    {ws.workspace_url_image && !ws.workspace_url_image.includes('ui-avatars.com') && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleWorkspaceImageDelete(ws.workspace_id)}
                                                            title="Eliminar imagen"
                                                            className="btn-del-mini"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                    <input 
                                                        ref={workspaceImageRef}
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => handleWorkspaceImageUpload(e, ws.workspace_id)}
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                value={editingWorkspaceDescription}
                                                onChange={(e) => setEditingWorkspaceDescription(e.target.value)}
                                                placeholder="Descripción"
                                                className="sidebar-textarea"
                                            />
                                            <div className="edit-actions">
                                                <button type="submit" title="Guardar">✓</button>
                                                <button type="button" onClick={() => setEditingWorkspaceId(null)} title="Cancelar">✕</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="list-item-content">
                                            <Link to={`/workspace/${ws.workspace_id}`} title={ws.workspace_description || ''}>
                                                <div className="ws-avatar">
                                                    {ws.workspace_url_image ? (
                                                        <img src={ws.workspace_url_image} alt={ws.workspace_title} className="ws-avatar-img" />
                                                    ) : (
                                                        ws.workspace_title.substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="ws-name">{ws.workspace_title}</span>
                                            </Link>
                                            <div className="ws-actions">
                                                <button 
                                                    className="icon-btn edit-btn" 
                                                    onClick={() => {
                                                        setEditingWorkspaceId(ws.workspace_id);
                                                        setEditingWorkspaceName(ws.workspace_title);
                                                        setEditingWorkspaceDescription(ws.workspace_description || '');
                                                    }}
                                                    title="Editar"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button className="icon-btn delete-btn" onClick={() => handleDeleteWorkspace(ws.workspace_id)} title="Archivar">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}

                            {archivedWorkspaces.length > 0 && (
                                <li className={`archived-toggle ${showArchivedWorkspaces ? 'is-open' : ''}`} onClick={() => setShowArchivedWorkspaces(!showArchivedWorkspaces)}>
                                    <div className="toggle-header">
                                        <span className="toggle-label"><span className="toggle-folder-icon">📁</span> <span className="toggle-text">Archivados ({archivedWorkspaces.length})</span></span>
                                        <span className="toggle-icon">{showArchivedWorkspaces ? '▼' : '▶'}</span>
                                    </div>
                                </li>
                            )}

                            {showArchivedWorkspaces && archivedWorkspaces.map(ws => (
                                <li key={ws.workspace_id} className="archived-item">
                                    <div className="list-item-content">
                                        <div className="archived-link">
                                            <div className="ws-avatar archived">
                                                {ws.workspace_url_image ? (
                                                    <img src={ws.workspace_url_image} alt={ws.workspace_title} className="ws-avatar-img" />
                                                ) : (
                                                    ws.workspace_title.substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <span className="ws-name">{ws.workspace_title}</span>
                                        </div>
                                        <div className="ws-actions">
                                            <button className="icon-btn restore-btn" onClick={() => handleRestoreWorkspace(ws.workspace_id)} title="Restaurar">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </>
                    )}
                </ul>

                {/* Sección del Perfil de Usuario en la parte inferior de la columna */}
                <div className="sidebar-user-profile">
                    <div className="user-info">
                        <div 
                            className="user-avatar" 
                            onClick={() => setIsProfileModalOpen(true)}
                            title="Editar perfil"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setIsProfileModalOpen(true)}
                        >
                            {user?.image ? (
                                <img 
                                    src={user.image.startsWith('http') ? user.image : `${ENVIRONMENT.API_URL}${user.image}`} 
                                    alt={user.name} 
                                    className="avatar-img" 
                                />
                            ) : (
                                user?.name?.substring(0, 1).toUpperCase() || 'U'
                            )}
                            <div className="avatar-overlay">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            </div>
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || 'Usuario'}</span>
                            <span className="user-status">En línea</span>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <ThemeToggle />
                        <button className="logout-btn" onClick={logout} title="Cerrar sesión">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                </div>
            </div>


            {/* Sección de Canales y Miembros */}
            <div className="channels-column">
                {!workspace_id ? (
                    <div className="no-workspace-selected">
                        <div className="empty-icon">📂</div>
                        <p>Selecciona un espacio de trabajo para ver sus canales y miembros</p>
                    </div>
                ) : (
                    <>
                        <div className="mobile-workspace-context">
                            <span className="mobile-ws-label">Espacio actual:</span>
                            <h2 className="mobile-ws-name">{selectedWorkspace?.workspace_title}</h2>
                        </div>
                        <div className="column-header">
                            <h3><span className="header-icon">💬</span> Canales</h3>
                            {canManageMembers && (
                                <button
                                    className="add-btn"
                                    onClick={() => setShowNewChannelForm(!showNewChannelForm)}
                                    title="Crear Canal"
                                >
                                    +
                                </button>
                            )}
                        </div>

                        {showNewChannelForm && (
                            <form className="sidebar-form" onSubmit={handleCreateChannel}>
                                <input
                                    type="text"
                                    placeholder="Nombre canal..."
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    autoFocus
                                />
                                <div className="form-actions">
                                    <button type="submit">Crear</button>
                                    <button type="button" onClick={() => setShowNewChannelForm(false)}>X</button>
                                </div>
                            </form>
                        )}

                        <ul className="channel-list">
                            {loadingChannels ? (
                                <li className="loading">Cargando...</li>
                            ) : (
                                channels.length > 0 ? (
                                    channels.map(channel => (
                                        <li key={channel.channel_id} className={`channel-li-item ${channel_id === channel.channel_id.toString() ? 'active' : ''}`}>
                                            {editingChannelId === channel.channel_id ? (
                                                <form className="edit-inline-form" onSubmit={handleUpdateChannel}>
                                                    <input
                                                        value={editingChannelName}
                                                        onChange={(e) => setEditingChannelName(e.target.value)}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Escape') setEditingChannelId(null);
                                                        }}
                                                    />
                                                    <div className="edit-actions">
                                                        <button type="submit" title="Guardar">✓</button>
                                                        <button type="button" onClick={() => setEditingChannelId(null)} title="Cancelar">✕</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="list-item-content">
                                                    <Link
                                                        to={`/workspace/${workspace_id}/channel/${channel.channel_id}`}
                                                    >
                                                        <div className="channel-hash">#</div>
                                                        <span className="channel-name">{channel.channel_name}</span>
                                                        {unreadChannels[channel.channel_id] && <div className="unread-indicator" title="Mensajes sin leer"></div>}
                                                    </Link>
                                                    <div className="channel-actions">
                                                        {canManageMembers && (
                                                            <>
                                                                <button className="icon-btn edit-small-btn" onClick={() => startEditingChannel(channel)} title="Editar">
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                </button>
                                                                <button className="icon-btn delete-small-btn" onClick={() => handleDeleteChannel(channel.channel_id)} title="Eliminar">
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="empty">No hay canales activos</li>
                                )
                            )}
                        </ul>

                        {/* Sección de Canales Eliminados */}
                        <div className="deleted-channels-toggle" onClick={toggleDeletedChannels}>
                            <span>{showDeletedChannels ? '▼' : '▶'} Canales eliminados</span>
                        </div>

                        {showDeletedChannels && (
                            <ul className="channel-list deleted">
                                {loadingDeletedChannels ? (
                                    <li className="loading">Cargando...</li>
                                ) : deletedChannels.length > 0 ? (
                                    deletedChannels.map(channel => (
                                        <li key={channel.channel_id} className="channel-li-item deleted">
                                            <div className="list-item-content">
                                                <span className="channel-name-deleted"># {channel.channel_name}</span>
                                                <div className="item-actions">
                                                    <button 
                                                        className="icon-btn restore-btn" 
                                                        onClick={() => handleRestoreChannel(channel.channel_id)}
                                                        title="Restaurar canal"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="empty">No hay canales eliminados</li>
                                )}
                            </ul>
                        )}

                        <div className="column-header members-header">
                            <h3><span className="header-icon">👥</span> Miembros</h3>
                            {canManageMembers && (
                                <button
                                    className="add-btn"
                                    onClick={() => setShowInviteMemberForm(!showInviteMemberForm)}
                                    title="Invitar Miembro"
                                >
                                    +
                                </button>
                            )}
                        </div>

                        {showInviteMemberForm && (
                            <form className="sidebar-form" onSubmit={handleInviteMember}>
                                <input
                                    type="email"
                                    placeholder="Email del nuevo miembro..."
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    autoFocus
                                />
                                <div className="form-actions">
                                    <button type="submit">Invitar</button>
                                    <button type="button" onClick={() => setShowInviteMemberForm(false)}>X</button>
                                </div>
                            </form>
                        )}

                        <ul className="member-list">
                            {loadingMembers ? (
                                <li className="loading">Cargando...</li>
                            ) : (
                                members.length > 0 ? (
                                    members.map(member => {
                                        const isCurrentUser = member.user_id === user?.id || member.user_id === user?._id;
                                        return (
                                            <li key={member.member_id}>
                                                <div className={`member-item ${dm_member_id === member.member_id.toString() ? 'active' : ''} ${isCurrentUser ? 'self-member' : ''}`}>
                                                    {isCurrentUser ? (
                                                        <div className="member-info-wrapper">
                                                            <div className="member-avatar-small">
                                                                {member.user_image ? (
                                                                    <img src={member.user_image} alt={member.user_name} className="avatar-img" />
                                                                ) : (
                                                                    member.user_name?.substring(0, 1).toUpperCase() || 'M'
                                                                )}
                                                            </div>
                                                            <div className="member-name-container">
                                                                <span className="member-name-small">{member.user_name || member.user_email} (tú)</span>
                                                                {unreadDMs[member.member_id] && <div className="unread-indicator" title="Mensajes sin leer"></div>}
                                                                <span className={`member-role-badge role-${member.member_role}`}>
                                                                    {member.member_role === 'owner' ? 'creador' :
                                                                        member.member_role === 'admin' ? 'admin' : 'normal'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Link 
                                                            to={`/workspace/${workspace_id}/dm/${member.member_id}`}
                                                            className="member-dm-link"
                                                        >
                                                            <div className="member-info-wrapper">
                                                                <div className="member-avatar-small">
                                                                    {member.user_image ? (
                                                                        <img src={member.user_image} alt={member.user_name} className="avatar-img" />
                                                                    ) : (
                                                                        member.user_name?.substring(0, 1).toUpperCase() || 'M'
                                                                    )}
                                                                </div>
                                                                <div className="member-name-container">
                                                                    <span className="member-name-small">{member.user_name || member.user_email}</span>
                                                                    {unreadDMs[member.member_id] && <div className="unread-indicator" title="Mensajes sin leer"></div>}
                                                                    {member.member_role === 'owner' || member.invitation_status === 'accepted' ? (
                                                                        editingMemberRoleId === member.member_id ? (
                                                                            <select
                                                                                className="role-select"
                                                                                value={member.member_role}
                                                                                onChange={(e) => handleUpdateMemberRole(member.member_id, e.target.value)}
                                                                                onBlur={() => setEditingMemberRoleId(null)}
                                                                                autoFocus
                                                                            >
                                                                                <option value="user">normal</option>
                                                                                <option value="admin">admin</option>
                                                                                {member.member_role === 'owner' && <option value="owner">creador</option>}
                                                                            </select>
                                                                        ) : (
                                                                            <span
                                                                                className={`member-role-badge role-${member.member_role} ${canManageMembers && member.member_role !== 'owner' ? 'clickable-badge' : ''}`}
                                                                                onClick={(e) => {
                                                                                    e.preventDefault(); // Evita la navegación del Link
                                                                                    canManageMembers && member.member_role !== 'owner' && setEditingMemberRoleId(member.member_id);
                                                                                }}
                                                                                title={canManageMembers && member.member_role !== 'owner' ? "Cambiar rol" : ""}
                                                                            >
                                                                                {member.member_role === 'owner' ? 'creador' :
                                                                                    member.member_role === 'admin' ? 'admin' : 'normal'}
                                                                            </span>
                                                                        )
                                                                    ) : (
                                                                        <span className={`member-role-badge status-${member.invitation_status}`}>
                                                                            {member.invitation_status === 'pending' ? 'Pendiente' : 'Rechazada'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )}
                                                    {canManageMembers && member.member_role !== 'owner' && !isCurrentUser && (
                                                        <button className="icon-btn delete-small-btn member-delete" onClick={() => handleRemoveMember(member.member_id)} title="Eliminar miembro">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li className="empty">No hay miembros</li>
                                )
                            )}
                        </ul>
                    </>
                )}
            </div>

        </aside>
    );
};

export default Sidebar;
