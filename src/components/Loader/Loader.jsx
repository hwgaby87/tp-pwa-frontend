/**
 * @file Loader.jsx
 * @description Componente de carga (spinner) reutilizable.
 * Admite diferentes tamaños y colores para adaptarse a diversos contextos de la UI.
 */

import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', color = 'var(--accent-color)' }) => {
    return (
        <div className={`loader-container ${size}`}>
            <div 
                className="loader-spinner" 
                style={{ borderTopColor: color }}
            ></div>
        </div>
    );
};

export default Loader;
