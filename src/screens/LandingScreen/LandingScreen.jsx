import React from 'react';
import { Link } from 'react-router';
import './LandingScreen.css';

const LandingScreen = () => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo">
                    <h2>Conecta</h2>
                </div>
                <nav className="landing-nav">
                    <Link to="/login" className="nav-link">Iniciar sesión</Link>
                    <Link to="/register" className="nav-link button-primary">Registrarse</Link>
                </nav>
            </header>

            <main className="landing-main">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Comunicación fluida y profesional para tu equipo</h1>
                        <p className="hero-subtitle">
                            Reúne a todas las personas y herramientas en un solo lugar. 
                            Colabora desde cualquier parte con canales organizados y comunicación en tiempo real.
                        </p>
                        <div className="hero-cta">
                            <Link to="/register" className="button-large">Comenzar gratis</Link>
                            <Link to="/login" className="button-large button-secondary">Ya tengo cuenta</Link>
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon">📁</div>
                        <h3>Espacios de trabajo</h3>
                        <p>Crea o únete a múltiples espacios para separar proyectos o empresas de forma ordenada.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Canales dedicados</h3>
                        <p>Organiza conversaciones por temas, proyectos o equipos en canales específicos.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Tiempo real</h3>
                        <p>Mensajería instantánea para mantener a tu equipo sincronizado y productivo en todo momento.</p>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} Conecta. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default LandingScreen;
