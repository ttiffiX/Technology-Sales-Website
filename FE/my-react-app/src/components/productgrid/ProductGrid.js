import React from 'react';
import {useNavigate} from 'react-router-dom';
import './ProductGrid.scss';
import {formatPrice, getImage} from '../../utils';
import {useCompare} from '../../contexts/CompareContext';

function ProductGrid({products, categoryId}) {
    const navigate = useNavigate();
    const {addToCompare, compareProducts} = useCompare();


    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleCompareClick = (e, product) => {
        e.stopPropagation(); // Prevent navigation when clicking compare
        addToCompare(product, categoryId);
    };

    const isInCompare = (productId) => {
        return compareProducts.some(p => p.id === productId);
    };

    if (!products || products.length === 0) {
        return (
            <div className="product-grid-empty">
                <p>No products found</p>
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map((product) => (
                <div
                    className={`product-item ${product.stocked ? '' : 'out-of-stock'}`}
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                >
                    <div className="pic" style={{backgroundImage: `url(${getImage(product.imageUrl)})`}}></div>
                    {/*<div className="pic" style={{backgroundImage: `url(${pic})`}}></div>*/}
                    <div className="category-badge">{product.categoryName}</div>
                    <div className="techName">{product.title}</div>
                    <div className="price">{formatPrice(product.price)}</div>
                    {product.quantitySold > 0 && (
                        <div className="sold-count">Sold: {product.quantitySold}</div>
                    )}
                    {/* Only show compare button when category is selected */}
                    {categoryId && (
                        <button
                            className={`compareBtn ${isInCompare(product.id) ? 'active' : ''} ${compareProducts.length >= 3 && !isInCompare(product.id) ? 'disabled' : ''}`}
                            onClick={(e) => handleCompareClick(e, product)}
                            disabled={compareProducts.length >= 3 && !isInCompare(product.id)}
                        >
                            {isInCompare(product.id) ? '✓ Selected' : 'Compare'}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ProductGrid;
