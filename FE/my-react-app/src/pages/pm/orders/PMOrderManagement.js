import React from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../../../components/navigation/Nav';
import Header from '../../../components/header/Header';
import './PMOrderManagement.scss';

function PMOrderManagement() {
    const navigate = useNavigate();

    return (
        <div className="pm-order-page">
            <Nav count={0} />
            <Header title="Order Management" modeDisplay="default" />

            <div className="pm-order-content">
                <div className="pm-order-topbar">
                    <button className="pm-order-back-btn" onClick={() => navigate('/pm')}>
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="pm-order-placeholder">
                    <span className="pm-order-placeholder__icon">🧾</span>
                    <p>Order management is coming soon.</p>
                </div>
            </div>
        </div>
    );
}

export default PMOrderManagement;

