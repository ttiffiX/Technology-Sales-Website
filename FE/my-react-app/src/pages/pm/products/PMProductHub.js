import React from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../../../components/navigation/Nav';
import Header from '../../../components/header/Header';
import './PMProductHub.scss';

function PMProductHub() {
    const navigate = useNavigate();

    const cards = [
        {
            title: 'Products',
            description: 'View, add, update state, and delete products.',
            path: '/pm/products/list',
        },
        {
            title: 'Categories',
            description: 'Add, update, or delete categories.',
            path: '/pm/products/categories',
        },
        {
            title: 'Attribute Schema',
            description: 'Manage attribute fields by category.',
            path: '/pm/products/attributes',
        },
    ];

    return (
        <div className="pm-product-hub-page">
            <Nav count={0} />
            <Header title="Product Management" modeDisplay="default" />

            <div className="pm-product-hub-content">
                <div className="pm-product-hub-toolbar">
                    <button className="pm-btn-back" onClick={() => navigate('/pm')}>
                        ← Back to Dashboard
                    </button>
                </div>

                <h2 className="pm-product-hub-title">Product Workspace</h2>
                <p className="pm-product-hub-subtitle">Choose one section to manage</p>

                <div className="pm-product-hub-cards">
                    {cards.map((card) => (
                        <div
                            key={card.path}
                            className="pm-product-hub-card"
                            onClick={() => navigate(card.path)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => event.key === 'Enter' && navigate(card.path)}
                        >
                            <h3 className="pm-product-hub-card__title">{card.title}</h3>
                            <p className="pm-product-hub-card__desc">{card.description}</p>
                            <span className="pm-product-hub-card__arrow">→</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PMProductHub;

