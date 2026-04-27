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
