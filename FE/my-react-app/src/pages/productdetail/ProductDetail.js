import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.scss';
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import { getProductDetail } from "../../api/ProductAPI";
import { getCartItems } from "../../api/CartAPI";
import AddToCart from "../../utils/AddToCart";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [count, setCount] = useState(0);
    const { totalQuantity } = getCartItems();

    useEffect(() => {
        setCount(totalQuantity);
    }, [totalQuantity]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductDetail(id);
                setProduct(data);
            } catch (err) {
                setError(err.response.data || 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product && product.stocked) {
            AddToCart(product.id, setCount);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="MyApp">
                <Nav count={count} />
                <Header title="Product Detail" modeDisplay="normal" />
                <div className="product-detail-container">
                    <div className="loading">Loading product detail...</div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="MyApp">
                <Nav count={count} />
                <Header title="Product Detail" modeDisplay="normal" />
                <div className="product-detail-container">
                    <div className="error">{error || 'Product not found'}</div>
                    <button onClick={handleBack} className="back-btn">Back to Products</button>
                </div>
            </div>
        );
    }

    return (
        <div className="MyApp">
            <Nav count={count} />
            <Header title="Product Detail" modeDisplay="normal" />

            <div className="product-detail-container">
                <button onClick={handleBack} className="back-btn">
                    ← Back
                </button>

                <div className="product-detail-content">
                    {/* Left side - Image */}
                    <div className="product-image-section">
                        <div className="product-image">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.title} />
                            ) : (
                                <div className="no-image">No Image</div>
                            )}
                        </div>
                        {product.categoryName && (
                            <div className="category-tag">{product.categoryName}</div>
                        )}
                    </div>

                    {/* Right side - Details */}
                    <div className="product-info-section">
                        <h1 className="product-title">{product.title}</h1>

                        <div className="product-price-section">
                            <span className="product-price">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(product.price)}
                            </span>
                            {product.quantitySold > 0 && (
                                <span className="sold-count">
                                    Sold: {product.quantitySold}
                                </span>
                            )}
                        </div>

                        <div className="stock-status">
                            {product.stocked ? (
                                <span className="in-stock">✓ In Stock</span>
                            ) : (
                                <span className="out-of-stock">✗ Out of Stock</span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="product-description">
                                <h3>Description</h3>
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="product-specifications">
                                <h3>Specifications</h3>
                                <table className="specs-table">
                                    <tbody>
                                        {Object.entries(product.attributes).map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="spec-label">{key}</td>
                                                <td className="spec-value">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button
                                className={`add-to-cart-btn ${!product.stocked ? 'disabled' : ''}`}
                                onClick={handleAddToCart}
                                disabled={!product.stocked}
                            >
                                {product.stocked ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

