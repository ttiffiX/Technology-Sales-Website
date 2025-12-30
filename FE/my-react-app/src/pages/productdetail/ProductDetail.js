import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.scss';
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import { getProductDetail } from "../../api/ProductAPI";
import { addCartItem, fetchCartItems } from "../../api/CartAPI";
import { useToast } from "../../components/Toast/Toast";
import { isAuthenticated } from "../../api/AuthAPI";
import {formatPrice, getImage} from "../../utils";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { triggerToast } = useToast();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [count, setCount] = useState(0);
    const [addingToCart, setAddingToCart] = useState(false);

    // Load cart count on mount
    useEffect(() => {
        const loadCart = async () => {
            try {
                const { totalQuantity } = await fetchCartItems();
                setCount(totalQuantity);
            } catch (err) {
                // Ignore error if user not logged in
                console.log('Cart not loaded:', err);
            }
        };
        loadCart();
    }, []);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductDetail(id);
                setProduct(data);
            } catch (err) {
                setError(err.response?.data || 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || !product.stocked) return;

        // Check if user is logged in
        if (!isAuthenticated()) {
            triggerToast('error', 'Please login to add items to cart');
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        try {
            // Check current cart quantity
            const { totalQuantity } = await fetchCartItems();
            if (totalQuantity >= 10) {
                triggerToast('error', 'Maximum 10 items in cart');
                return;
            }

            // Add to cart
            const response = await addCartItem(product.id);
            triggerToast('success', response || 'Added to cart successfully');

            // Refresh cart count
            const updated = await fetchCartItems();
            setCount(updated.totalQuantity);
        } catch (err) {
            console.error('Error adding to cart:', err);
            triggerToast('error', err || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
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
                            {/*<div className="product-image">*/}
                            {/*    {product.imageUrl ? (*/}
                            {/*        <img src={product.imageUrl} alt={product.title} />*/}
                            {/*    ) : (*/}
                            {/*        <div className="no-image">No Image</div>*/}
                            {/*    )}*/}
                            {/*</div>*/}
                        <div className="product-image" style={{backgroundImage: `url(${getImage(product.imageUrl)})`}}></div>
                        {product.categoryName && (
                            <div className="category-tag">{product.categoryName}</div>
                        )}
                        {/*<div className="product-image" style={{backgroundImage: `url(${getImage(product.imageUrl)})`}}></div>*/}
                    </div>

                    {/* Right side - Details */}
                    <div className="product-info-section">
                        <h1 className="product-title">{product.title}</h1>

                        <div className="product-price-section">
                            <span className="product-price">
                                {formatPrice(product.price)}
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
                                disabled={!product.stocked || addingToCart}
                            >
                                {addingToCart ? 'Adding...' : product.stocked ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

