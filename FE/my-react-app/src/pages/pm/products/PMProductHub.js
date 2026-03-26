import React from 'react';
import { useNavigate } from 'react-router-dom';
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
            path: '/pm/categories',
        },
        {
            title: 'Attribute Schema',
            description: 'Manage attribute fields by category.',
            path: '/pm/attributes',
        },
    ];

    return (
        <div className="pm-product-hub">
            <div className="pm-product-hub__header">
                <h2>Product Workspace</h2>
                <p>Choose one section to manage</p>
            </div>

            <div className="pm-product-hub__cards">
                {cards.map((card) => (
                    <div
                        key={card.path}
                        className="pm-product-hub__card"
                        onClick={() => navigate(card.path)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => event.key === 'Enter' && navigate(card.path)}
                    >
                        <h3 className="pm-product-hub__card-title">{card.title}</h3>
                        <p className="pm-product-hub__card-desc">{card.description}</p>
                        <span className="pm-product-hub__card-arrow">→</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PMProductHub;

