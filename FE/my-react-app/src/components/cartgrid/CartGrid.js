import React, {useEffect, useState, useCallback, useRef} from 'react';
import './CartGrid.scss';
import {useNavigate} from "react-router-dom";
import {
    removeCartItem,
    updateCartQuantity,
    toggleProductSelection,
    toggleAllProducts
} from "../../api/CartAPI";
import {useToast} from "../Toast/Toast";
import {formatPrice, getImage} from "../../utils";

function CartGrid({products, count}) {
    const {triggerToast} = useToast();
    const navigate = useNavigate();

    const [localProducts, setLocalProducts] = useState([]);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [inputValues, setInputValues] = useState({});
    const [updatingProducts, setUpdatingProducts] = useState(new Set());

    const updateTimers = useRef({});
    const clickTimers = useRef({});

    useEffect(() => {
        if (products && products.length > 0) {
            setLocalProducts(products);
            setSelectAll(products.every(p => p.selected));

            // Initialize input values
            const initialValues = {};
            products.forEach(p => {
                initialValues[p.cartDetailId] = p.quantity;
            });
            setInputValues(initialValues);
        } else {
            setLocalProducts([]);
            setSelectAll(false);
            setInputValues({});
        }
    }, [products]);

    // Update cart state from API response
    const updateCartFromResponse = useCallback((cartData) => {
        const {cartDetailDTO, totalQuantity} = cartData;
        setLocalProducts(cartDetailDTO);
        count(totalQuantity);

        if (cartDetailDTO.length > 0) {
            setSelectAll(cartDetailDTO.every(p => p.selected));
            const newValues = {};
            cartDetailDTO.forEach(p => {
                newValues[p.cartDetailId] = p.quantity;
            });
            setInputValues(newValues);
        } else {
            setSelectAll(false);
            setInputValues({});
        }
    }, [count]);

    const handleQuantitySubmit = useCallback(async (productId, newQuantity, cartDetailId) => {
        setUpdatingProducts(prev => new Set(prev).add(cartDetailId));
        try {
            const cartData = await updateCartQuantity(productId, newQuantity);
            updateCartFromResponse(cartData);
            triggerToast('success', 'Quantity updated');
        } catch (err) {
            triggerToast('error', err);
            // Revert to original value from products prop
            const originalProduct = products.find(p => p.cartDetailId === cartDetailId);
            if (originalProduct) {
                setInputValues(prev => ({...prev, [cartDetailId]: originalProduct.quantity}));
            }
        } finally {
            setUpdatingProducts(prev => {
                const next = new Set(prev);
                next.delete(cartDetailId);
                return next;
            });
        }
    }, [updateCartFromResponse, triggerToast, products]);

    const handleQuantityChange = (cartDetail, check) => {
        const cartDetailId = cartDetail.cartDetailId;
        const currentQty = inputValues[cartDetailId] || cartDetail.quantity;
        let newQty;

        if (check) {
            newQty = currentQty + 1;
        } else {
            if (currentQty <= 1) {
                setProductToDelete(cartDetail);
                setShowConfirmPopup(true);
                return;
            }

            newQty = currentQty - 1;
        }

        // Update local state immediately
        setInputValues(prev => ({...prev, [cartDetailId]: newQty}));

        // Clear existing timer
        if (clickTimers.current[cartDetailId]) {
            clearTimeout(clickTimers.current[cartDetailId]);
        }

        // Set new timer - call API after 1 second of no clicks
        clickTimers.current[cartDetailId] = setTimeout(() => {
            handleQuantitySubmit(cartDetail.productList.id, newQty, cartDetailId);
        }, 1000);
    };

    const handleInputChange = (cartDetailId, productId, currentQuantity, newValue) => {
        // Allow empty string temporarily for user to type
        if (newValue === '') {
            setInputValues(prev => ({...prev, [cartDetailId]: ''}));

            // Clear existing timer
            if (updateTimers.current[cartDetailId]) {
                clearTimeout(updateTimers.current[cartDetailId]);
            }

            // Set timer to revert to current quantity if user doesn't type
            updateTimers.current[cartDetailId] = setTimeout(() => {
                setInputValues(prev => ({...prev, [cartDetailId]: currentQuantity}));
            }, 2000);
            return;
        }

        // Parse the value
        const numValue = parseInt(newValue);

        // Update local display immediately (even if invalid, to show what user typed)
        setInputValues(prev => ({...prev, [cartDetailId]: newValue}));

        // Clear existing timer
        if (updateTimers.current[cartDetailId]) {
            clearTimeout(updateTimers.current[cartDetailId]);
        }

        // Validate input
        if (isNaN(numValue) || numValue < 1 || numValue > 10) {
            // Revert after delay if invalid
            updateTimers.current[cartDetailId] = setTimeout(() => {
                setInputValues(prev => ({...prev, [cartDetailId]: currentQuantity}));
                if (!isNaN(numValue)) {
                    triggerToast('error', 'Quantity must be between 1 and 10');
                }
            }, 1500);
            return;
        }

        // If valid and different, update after delay
        if (numValue !== currentQuantity) {
            updateTimers.current[cartDetailId] = setTimeout(() => {
                handleQuantitySubmit(productId, numValue, cartDetailId);
            }, 1000);
        }
    };

    const handleConfirmRemove = async () => {
        try {
            const cartData = await removeCartItem(productToDelete.productList.id);
            updateCartFromResponse(cartData);
            triggerToast('success', 'Item removed');
        } catch (err) {
            triggerToast('error', err);
        } finally {
            setProductToDelete(null);
            setShowConfirmPopup(false);
        }
    };

    const handleDelete = async (productId) => {
        try {
            const cartData = await removeCartItem(productId);
            updateCartFromResponse(cartData);
            triggerToast('success', 'Item deleted');
        } catch (err) {
            triggerToast('error', err);
        }
    };

    const handleToggleSelect = async (cartDetail) => {
        try {
            const cartData = await toggleProductSelection(cartDetail.productList.id);
            updateCartFromResponse(cartData);
        } catch (err) {
            triggerToast('error', err);
        }
    };

    const handleToggleAll = async () => {
        try {
            const next = !selectAll;
            const cartData = await toggleAllProducts(next);
            updateCartFromResponse(cartData);
        } catch (err) {
            triggerToast('error', err);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    }

    const selectedTotalPrice = localProducts
        .filter(p => p.selected)
        .reduce((sum, item) => sum + item.productList.price * item.quantity, 0);

    const PlaceOrder = () => navigate('/checkout');
    const buyNow = () => navigate('/');

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(updateTimers.current).forEach(timer => clearTimeout(timer));
            Object.values(clickTimers.current).forEach(timer => clearTimeout(timer));
        };
    }, []);

    return (
        <>

            {localProducts.length === 0 && (
                <div className="empty-cart-message">
                    <p>Your cart is empty.</p>
                    <button onClick={buyNow}>Buy Now!</button>
                </div>
            )}

            {showConfirmPopup && (
                <div className="confirm-popup">
                    <div className="popup-content">
                        <p>Remove this item from cart?</p>
                        <div className="popup-actions">
                            <button onClick={handleConfirmRemove}>Yes</button>
                            <button onClick={() => {
                                setShowConfirmPopup(false);
                                setProductToDelete(null);
                            }}>No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {localProducts.length > 0 && (
                <div className="select-all-bar">
                    <label>
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleToggleAll}
                        />
                        <span>Select All</span>
                    </label>
                </div>
            )}

            <div className="cart-grid">
                {localProducts.map(cd => (
                    <div
                        className={'cart-item'}
                        key={cd.cartDetailId}
                    >
                        {updatingProducts.has(cd.cartDetailId) && (
                            <div className="item-updating-overlay">
                                <div className="mini-spinner"></div>
                            </div>
                        )}

                        <div className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={cd.selected}
                                onChange={() => handleToggleSelect(cd)}
                            />
                        </div>

                        <button
                            className="cart-delete-button"
                            onClick={() => handleDelete(cd.productList.id)}
                        >
                            ✕
                        </button>

                        <div
                            className="cart-pic"
                            style={{backgroundImage: `url(${getImage(cd.productList.imageUrl)})`}}
                        />

                        <div className="cart-content">
                            <div
                                className="cart-techName"
                                onClick={() => handleProductClick(cd.productList.id)}
                            >
                                {cd.productList.title}
                            </div>
                            <div className="cart-price">{formatPrice(cd.productList.price)}</div>

                            <div className="cart-actions">
                                <button
                                    className="quantity-btn"
                                    onClick={() => handleQuantityChange(cd, 0)}
                                    disabled={updatingProducts.has(cd.cartDetailId)}
                                >
                                    -
                                </button>

                                <input
                                    type="number"
                                    className="quantity-input"
                                    min="1"
                                    max="10"
                                    value={inputValues[cd.cartDetailId] ?? cd.quantity}
                                    onChange={(e) => handleInputChange(
                                        cd.cartDetailId,
                                        cd.productList.id,
                                        cd.quantity,
                                        e.target.value
                                    )}
                                    onBlur={(e) => {
                                        // If empty on blur, restore to current quantity
                                        if (e.target.value === '' || e.target.value === null) {
                                            setInputValues(prev => ({...prev, [cd.cartDetailId]: cd.quantity}));
                                        }
                                    }}
                                    disabled={updatingProducts.has(cd.cartDetailId)}
                                />

                                <button
                                    className="quantity-btn"
                                    onClick={() => handleQuantityChange(cd, 1)}
                                    disabled={updatingProducts.has(cd.cartDetailId)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {localProducts.length > 0 && (
                    <div className="checkout-summary-placeOrder">
                        <div className="header-placeOrder">Total (Selected)</div>
                        <div className="total-container-placeOrder">
                            <span className="amount-placeOrder">
                                {formatPrice(selectedTotalPrice)}
                            </span>
                        </div>
                        <button
                            className="payment-button-placeOrder"
                            onClick={PlaceOrder}
                            disabled={selectedTotalPrice === 0}
                        >
                            Proceed to Checkout
                            <div className="icon-placeOrder">→</div>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default CartGrid;

