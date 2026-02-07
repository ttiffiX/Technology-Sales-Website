import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../../contexts/CompareContext';
import { getImage, formatPrice } from '../../utils';
import './CompareBar.scss';

function CompareBar() {
    const navigate = useNavigate();
    const {
        compareProducts,
        removeFromCompare,
        clearCompare,
        isMinimized,
        toggleMinimize
    } = useCompare();

    if (compareProducts.length === 0) {
        return null;
    }

    const handleCompare = () => {
        if (compareProducts.length >= 2) {
            navigate('/compare');
        }
    };

    return (
        <div className={`compare-bar ${isMinimized ? 'minimized' : ''}`}>
            <div className="compare-bar-header" onClick={toggleMinimize}>
                <h3>Product Comparison ({compareProducts.length}/3)</h3>
                <button className="minimize-btn">
                    {isMinimized ? '▲' : '▼'}
                </button>
            </div>

            {!isMinimized && (
                <div className="compare-bar-content">
                    <div className="compare-products">
                        {[0, 1, 2].map(index => (
                            <div key={index} className={`compare-slot ${compareProducts[index] ? 'filled' : 'empty'}`}>
                                {compareProducts[index] ? (
                                    <>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCompare(compareProducts[index].id)}
                                        >
                                            ✕
                                        </button>
                                        <div className="product-image" style={{
                                            backgroundImage: `url(${getImage(compareProducts[index].imageUrl)})`
                                        }}></div>
                                        <div className="product-name">{compareProducts[index].title}</div>
                                        <div className="product-price">{formatPrice(compareProducts[index].price)}</div>
                                    </>
                                ) : (
                                    <div className="empty-slot-text">Select product</div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="compare-actions">
                        <button
                            className="clear-btn"
                            onClick={clearCompare}
                        >
                            Clear All
                        </button>
                        <button
                            className={`compare-btn ${compareProducts.length < 2 ? 'disabled' : ''}`}
                            onClick={handleCompare}
                            disabled={compareProducts.length < 2}
                        >
                            Compare Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompareBar;




