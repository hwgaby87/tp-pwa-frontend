import React, { useState } from 'react';
import { Sidebar } from '../../components';
import { createWorkspace } from '../../services/workspaceService';
import './HomeScreen.css';

const HomeScreen = () => {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const response = await createWorkspace(name);
            if (response.ok) {
                if (response.data?.workspace_id) {
                    window.location.href = `/workspace/${response.data.workspace_id}`;
                } else {
                    window.location.reload();
                }
            } else {
                alert(response.message || "Error al crear el espacio de trabajo");
            }
        } catch (error) {
            console.error("Error creating workspace", error);
            alert("Error al crear el espacio de trabajo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`home-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
            <main className="home-main-content">
                <button 
                    className="mobile-menu-btn absolute" 
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Abrir menú"
                >
                    ☰
                </button>
                <div className="home-hero">
                    <div className="welcome-illustration">🚀</div>
                    <h1>Bienvenido a Conecta</h1>
                    <p>
                        Selecciona un espacio de trabajo en el panel lateral para comenzar,
                        o crea uno nuevo para tu equipo.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default HomeScreen;