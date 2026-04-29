/**
 * @file ProfileModal.jsx
 * @description Componente modal para la gestión del perfil del usuario autenticado.
 * Permite a los usuarios actualizar su foto de perfil (vía upload o drag & drop), 
 * eliminar su foto actual y modificar su nombre de visualización.
 */

import React, { useState, useRef, useCallback, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { uploadProfilePicture, deleteProfilePicture, updateUserData } from '../../services/userService';
import { toast } from 'sonner';
import ENVIRONMENT from '../../config/environment';
import './ProfileModal.css';

/**
 * Modal de edición del perfil de usuario.
 * Permite cambiar foto de perfil (con arrastrar y soltar), editar nombre y eliminar foto.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto.
 * @param {Function} props.onClose - Callback para cerrar el modal.
 */
const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateToken, setUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [pendingFile, setPendingFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');

    const getCurrentAvatarSrc = () => {
        if (preview) return preview;
        if (user?.image) {
            return user.image.startsWith('http')
                ? user.image
                : `${ENVIRONMENT.API_URL}${user.image}`;
        }
        return null;
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen es demasiado grande (máximo 5MB)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
        setPendingFile(file);
    };

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    }, []);

    const handleUpload = async () => {
        if (!pendingFile) return;
        setIsUploading(true);
        const loadingToast = toast.loading('Subiendo imagen...');
        try {
            const response = await uploadProfilePicture(pendingFile);
            if (response.ok) {
                if (response.data?.auth_token) {
                    updateToken(response.data.auth_token);
                } else {
                    setUser(prev => ({
                        ...prev,
                        image: response.data?.user?.image || response.data?.image
                    }));
                }
                toast.success('Foto de perfil actualizada', { id: loadingToast });
                setPendingFile(null);
                setPreview(null);
                onClose();
            } else {
                toast.error(response.message || 'Error al subir la imagen', { id: loadingToast });
            }
        } catch {
            toast.error('Error al subir la imagen', { id: loadingToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const loadingToast = toast.loading('Eliminando foto...');
        try {
            const response = await deleteProfilePicture();
            if (response.ok) {
                if (response.data?.auth_token) {
                    updateToken(response.data.auth_token);
                } else {
                    setUser(prev => ({ ...prev, image: null }));
                }
                toast.success('Foto eliminada', { id: loadingToast });
                setPendingFile(null);
                setPreview(null);
                onClose();
            } else {
                toast.error(response.message || 'Error al eliminar la foto', { id: loadingToast });
            }
        } catch {
            toast.error('Error al eliminar la foto', { id: loadingToast });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSaveName = async () => {
        if (!newName.trim() || newName.trim() === user?.name) {
            setEditingName(false);
            return;
        }
        setIsSavingName(true);
        try {
            const response = await updateUserData({ name: newName.trim() });
            if (response.ok) {
                if (response.data?.auth_token) {
                    updateToken(response.data.auth_token);
                } else {
                    setUser(prev => ({ ...prev, name: newName.trim() }));
                }
                toast.success('Nombre actualizado');
                setEditingName(false);
            } else {
                toast.error(response.message || 'Error al actualizar el nombre');
            }
        } catch {
            toast.error('Error al actualizar el nombre');
        } finally {
            setIsSavingName(false);
        }
    };

    const handleCancel = () => {
        setPendingFile(null);
        setPreview(null);
        setEditingName(false);
        setNewName(user?.name || '');
        onClose();
    };

    const avatarSrc = getCurrentAvatarSrc();
    const initials = user?.name?.substring(0, 2).toUpperCase() || 'U';

    if (!isOpen) return null;

    return (
        <div className="profile-modal-overlay" onClick={handleCancel}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="profile-modal-header">
                    <h2 className="profile-modal-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Editar Perfil
                    </h2>
                    <button className="profile-modal-close" onClick={handleCancel} aria-label="Cerrar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Avatar Section */}
                <div className="profile-modal-body">
                    <div className="avatar-section">
                        {/* Drop Zone */}
                        <div
                            className={`avatar-drop-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                            aria-label="Cambiar foto de perfil"
                        >
                            {avatarSrc ? (
                                <img src={avatarSrc} alt={user?.name} className="profile-modal-avatar-img" />
                            ) : (
                                <div className="profile-modal-avatar-initials">{initials}</div>
                            )}
                            <div className="avatar-drop-overlay">
                                {isDragging ? (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="16 16 12 12 8 16"></polyline>
                                            <line x1="12" y1="12" x2="12" y2="21"></line>
                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                                        </svg>
                                        <span>Soltar aquí</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        <span>Cambiar foto</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                        />

                        {/* Avatar Hint */}
                        <p className="avatar-hint">
                            {pendingFile
                                ? `📎 ${pendingFile.name}`
                                : 'Haz clic o arrastra una imagen (máx. 5MB)'}
                        </p>

                        {/* Avatar Actions */}
                        <div className="avatar-actions">
                            {pendingFile && (
                                <>
                                    <button
                                        className="btn-primary"
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <span className="btn-spinner"></span>
                                        ) : (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                        {isUploading ? 'Subiendo...' : 'Guardar foto'}
                                    </button>
                                    <button
                                        className="btn-ghost"
                                        onClick={() => { setPendingFile(null); setPreview(null); }}
                                        disabled={isUploading}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                            {!pendingFile && user?.image && (
                                <button
                                    className="btn-danger-ghost"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <span className="btn-spinner btn-spinner-red"></span>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    )}
                                    {isDeleting ? 'Eliminando...' : 'Eliminar foto'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Name Section */}
                    <div className="profile-modal-divider"></div>
                    <div className="name-section">
                        <label className="name-label">Nombre de usuario</label>
                        {editingName ? (
                            <div className="name-edit-row">
                                <input
                                    type="text"
                                    className="name-input"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveName();
                                        if (e.key === 'Escape') { setEditingName(false); setNewName(user?.name || ''); }
                                    }}
                                    autoFocus
                                    maxLength={50}
                                    placeholder="Tu nombre..."
                                />
                                <button
                                    className="btn-primary btn-sm"
                                    onClick={handleSaveName}
                                    disabled={isSavingName}
                                >
                                    {isSavingName ? <span className="btn-spinner"></span> : '✓'}
                                </button>
                                <button
                                    className="btn-ghost btn-sm"
                                    onClick={() => { setEditingName(false); setNewName(user?.name || ''); }}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="name-display-row">
                                <span className="name-display">{user?.name || 'Sin nombre'}</span>
                                <button
                                    className="btn-edit-name"
                                    onClick={() => { setEditingName(true); setNewName(user?.name || ''); }}
                                    title="Editar nombre"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Editar
                                </button>
                            </div>
                        )}
                        <span className="user-email-display">{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
