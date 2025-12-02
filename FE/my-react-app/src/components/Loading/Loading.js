import React from 'react';
import './Loading.scss';

export const Loading = ({ isLoading, fullScreen = false }) => {
    if (!isLoading) return null;

    return (
        <div className={`loading-overlay ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        </div>
    );
};

export default Loading;

