import React from 'react';

const Alert = ({ type, message }) => {
    if (!message) return null;

    const isError = type === 'error';
    
    return (
        <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`} role="alert">
            <div className="alert-icon">
                {isError ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                )}
            </div>
            <div className="alert-content">
                <p>{message}</p>
            </div>
        </div>
    );
};

export default Alert;
