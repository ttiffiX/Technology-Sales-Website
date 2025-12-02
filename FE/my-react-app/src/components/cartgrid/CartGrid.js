import React, {useEffect, useState, useCallback, useRef} from 'react';
import './CartGrid.scss';
import {useNavigate} from "react-router-dom";
import {
    fetchCartItems,
    removeCartItem,
    updateCartQuantity,
    toggleProductSelection,
    toggleAllProducts
} from "../../api/CartAPI";
import {useToast} from "../Toast/Toast";
import Loading from "../Loading/Loading";

function CartGrid({products, count}) {
    const {triggerToast} = useToast();
    const navigate = useNavigate();

    const [localProducts, setLocalProducts] = useState([]);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [inputValues, setInputValues] = useState({});
    const [updatingProducts, setUpdatingProducts] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

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

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

    const getImage = (imageName) => {
        if (!imageName) return '';
        try {
            return require(`../../assets/images/${imageName}`);
        } catch (error) {
            return '';
        }
    };

    const refreshCart = async () => {
        try {
            setIsLoading(true);
            const {cartDetailDTO, totalQuantity} = await fetchCartItems();
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
        } catch (err) {
            console.error(err.response?.data || 'Failed to refresh cart');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = useCallback(async (productId, newQuantity, cartDetailId) => {
        setUpdatingProducts(prev => new Set(prev).add(cartDetailId));
        try {
            await updateCartQuantity(productId, newQuantity);
            await refreshCart();
            triggerToast('success', 'Quantity updated');
        } catch (err) {
            triggerToast('error', err);
            await refreshCart(); // Refresh to restore correct state
        } finally {
            setUpdatingProducts(prev => {
                const next = new Set(prev);
                next.delete(cartDetailId);
                return next;
            });
        }
    }, []);

    const handleIncrease = (cartDetail) => {
        const cartDetailId = cartDetail.cartDetailId;
        const newQty = (inputValues[cartDetailId] || cartDetail.quantity) + 1;

        // Update local state immediately
        setInputValues(prev => ({...prev, [cartDetailId]: newQty}));

        // Clear existing timer
        if (clickTimers.current[cartDetailId]) {
            clearTimeout(clickTimers.current[cartDetailId]);
        }

        // Set new timer - call API after 1 second of no clicks
        clickTimers.current[cartDetailId] = setTimeout(() => {
            handleQuantityChange(cartDetail.productList.id, newQty, cartDetailId);
        }, 1000);
    };

    const handleDecrease = (cartDetail) => {
        const cartDetailId = cartDetail.cartDetailId;
        const currentQty = inputValues[cartDetailId] || cartDetail.quantity;

        if (currentQty <= 1) {
            setProductToDelete(cartDetail);
            setShowConfirmPopup(true);
            return;
        }

        const newQty = currentQty - 1;

        // Update local state immediately
        setInputValues(prev => ({...prev, [cartDetailId]: newQty}));

        // Clear existing timer
        if (clickTimers.current[cartDetailId]) {
            clearTimeout(clickTimers.current[cartDetailId]);
        }

        // Set new timer - call API after 1 second of no clicks
        clickTimers.current[cartDetailId] = setTimeout(() => {
            handleQuantityChange(cartDetail.productList.id, newQty, cartDetailId);
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
                handleQuantityChange(productId, numValue, cartDetailId);
            }, 1000);
        }
    };

    const handleConfirmRemove = async () => {
        try {
            await removeCartItem(productToDelete.productList.id);
            await refreshCart();
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
            await removeCartItem(productId);
            await refreshCart();
            triggerToast('success', 'Item deleted');
        } catch (err) {
            triggerToast('error', err);
        }
    };

    const handleToggleSelect = async (cartDetail) => {
        try {
            await toggleProductSelection(cartDetail.productList.id);
            await refreshCart();
        } catch (err) {
            triggerToast('error', err);
        }
    };

    const handleToggleAll = async () => {
        try {
            const next = !selectAll;
            await toggleAllProducts(next);
            await refreshCart();
        } catch (err) {
            triggerToast('error', err);
        }
    };

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
            <Loading isLoading={isLoading} />

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
                            <div className="cart-techName">{cd.productList.title}</div>
                            <div className="cart-price">{formatPrice(cd.productList.price)}</div>

                            <div className="cart-actions">
                                <button
                                    className="quantity-btn"
                                    onClick={() => handleDecrease(cd)}
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
                                    onClick={() => handleIncrease(cd)}
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

