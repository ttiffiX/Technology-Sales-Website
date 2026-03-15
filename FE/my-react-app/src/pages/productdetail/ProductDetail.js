import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.scss';
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import { getProductDetail } from "../../api/ProductAPI";
import { addCartItem } from "../../api/CartAPI";
import { useToast } from "../../components/Toast/Toast";
import { isAuthenticated } from "../../api/AuthAPI";
import {formatPrice, formatProductAttributeValue, getImage} from "../../utils";
import {useCart} from "../../contexts/CartContext";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { triggerToast } = useToast();
    const { cartCount, incrementCartCount, refreshCartCount } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

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
        if (!product) return;

        // Check if user is logged in
        if (!isAuthenticated()) {
            triggerToast('error', 'Please login to add items to cart');
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        try {
            // Add to cart
            const response = await addCartItem(product.id);
            triggerToast('success', response || 'Added to cart successfully');

            // Optimistic update: increment cart count immediately
            incrementCartCount();

            // Refresh cart count in background to ensure sync
            refreshCartCount();
        } catch (err) {
            console.error('Error adding to cart:', err);
            triggerToast('error', err || 'Failed to add to cart');

            // If error, refresh to get correct count
            refreshCartCount();
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
                <Nav count={cartCount} />
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
                <Nav count={cartCount} />
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
            <Nav count={cartCount} />
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
                                {Object.entries(product.attributes).map(([groupOrder, group]) => (
                                    <div key={groupOrder} className="spec-group">
                                        <h4 className="spec-group-name">{group.groupName}</h4>
                                        <table className="specs-table">
                                            <tbody>
                                                {group.filterAttributes?.map((attr, idx) => (
                                                    <tr key={idx}>
                                                        <td className="spec-label">{attr.attributeName}</td>
                                                        <td className="spec-value">
                                                            {formatProductAttributeValue(attr.availableValues)}
                                                            {attr.unit ? ` ${attr.unit}` : ''}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                            >
                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

