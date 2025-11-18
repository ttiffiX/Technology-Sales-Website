import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductGrid.scss';

function ProductGrid({products, count}) {
    const navigate = useNavigate();

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    const getImage = (imageName) => {
        if (!imageName) return '';
        try {
            return require(`../../assets/images/${imageName}`);
        } catch (error) {
            return '';
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleCompareClick = (e, productId) => {
        e.stopPropagation(); // Prevent navigation when clicking compare
        // TODO: Implement compare logic when API is ready
        console.log('Compare product:', productId);
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
                    <div className="category-badge">{product.categoryName}</div>
                    <div className="techName">{product.title}</div>
                    <div className="price">{formatPrice(product.price)}</div>
                    {product.quantitySold > 0 && (
                        <div className="sold-count">Sold: {product.quantitySold}</div>
                    )}
                    <button
                        className="compareBtn"
                        onClick={(e) => handleCompareClick(e, product.id)}
                    >
                        Compare
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ProductGrid;
