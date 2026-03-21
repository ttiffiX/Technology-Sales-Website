import React from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../../../components/navigation/Nav';
import Header from '../../../components/header/Header';
import './PMDashboard.scss';

function PMDashboard() {
    const navigate = useNavigate();

    return (
        <div className="pm-dashboard-page">
            <Nav count={0} />
            <Header title="PM Dashboard" modeDisplay="default" />

            <div className="pm-dashboard-content">
                <h2 className="pm-dashboard-title">Management Panel</h2>
                <p className="pm-dashboard-subtitle">Choose a section to manage</p>

                <div className="pm-dashboard-cards">
                    <div
                        className="pm-dashboard-card"
                        onClick={() => navigate('/pm/products')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/pm/products')}
                    >
                        <h3 className="pm-dashboard-card__title">Product</h3>
                        <p className="pm-dashboard-card__desc">
                            Open product workspace for products, categories, and attribute schema.
                        </p>
                        <span className="pm-dashboard-card__arrow">→</span>
                    </div>

                    <div
                        className="pm-dashboard-card"
                        onClick={() => navigate('/pm/orders')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/pm/orders')}
                    >
                        <h3 className="pm-dashboard-card__title">Order</h3>
                        <p className="pm-dashboard-card__desc">
                            View and process customer orders, update order statuses.
                        </p>
                        <span className="pm-dashboard-card__arrow">→</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PMDashboard;

