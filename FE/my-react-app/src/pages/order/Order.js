import React, {useEffect, useState} from 'react';
import './Order.scss';
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import {useGetCartItems} from "../../api/CartAPI";
import {useToast} from "../../components/Toast/Toast";
import {usePlaceOrder} from "../../api/OrderAPI";
import {useNavigate} from "react-router-dom";
import {formatPrice, getImage, isValidPhone, PROVINCES} from "../../utils";

const Order = () => {
    const {triggerToast} = useToast();
    const {cartItems, totalQuantity} = useGetCartItems();
    const {placeOrder, loading} = usePlaceOrder();
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const navigate = useNavigate();

    // Form data matching BE PlaceOrderRequest
    const [formData, setFormData] = useState({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        province: "",
        description: "",
        paymentMethod: "CASH" // CASH or VNPAY
    });

    // Load user profile data if available
    useEffect(() => {
        const userEmail = localStorage.getItem('email') || "";
        const userName = localStorage.getItem('name') || "";

        setFormData(prev => ({
            ...prev,
            customerName: userName,
            email: userEmail
        }));
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handlePaymentChange = (e) => {
        setFormData({...formData, paymentMethod: e.target.value});
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.customerName || !formData.phone || !formData.email ||
            !formData.address || !formData.province) {
            triggerToast("error", "Please fill in all required fields");
            return;
        }

        // Validate phone number format (Vietnamese)
        if (!isValidPhone(formData.phone)) {
            triggerToast("error", "Invalid Vietnamese phone number format");
            return;
        }

        setShowConfirmPopup(true);
    };

    const handleCancel = () => {
        setShowConfirmPopup(false);
    };

    const handleConfirm = async () => {
        try {
            const response = await placeOrder(formData);

            // Check if response has paymentUrl (VNPay payment)
            if (response.paymentUrl) {
                // VNPay payment - redirect to VNPay payment page
                setShowConfirmPopup(false);
                triggerToast("info", "Redirecting to VNPay payment...");
                // Redirect to VNPay
                setTimeout(() => {
                    window.location.href = response.paymentUrl;
                }, 500);
            } else {
                // CASH payment - show success and navigate to order history
                triggerToast("success", response.message || "Order placed successfully");
                setShowConfirmPopup(false);
                // Navigate to order history
                setTimeout(() => {
                    navigate("/orderhistory");
                }, 1000);
            }
        } catch (err) {
            triggerToast("error", err.message || "Failed to place order");
            setShowConfirmPopup(false);
        }
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.productList.price * item.quantity, 0);
    const deliveryFee = 30000; // Fixed for now, can be dynamic based on province
    const total = subtotal + deliveryFee;

    // Vietnamese provinces for dropdown
    return (
        <>
            {showConfirmPopup && (
                <div className="confirm-popup">
                    <div className="popup-content">
                        <h3>Confirm Order</h3>
                        <p>Are you sure you want to place this order?</p>
                        <div className="order-summary">
                            <p><strong>Total:</strong> {formatPrice(total)}</p>
                            <p><strong>Payment:</strong> {formData.paymentMethod}</p>
                        </div>
                        <div className="popup-actions">
                            <button onClick={handleConfirm} disabled={loading}>
                                {loading ? "Processing..." : "Yes, Place Order"}
                            </button>
                            <button onClick={handleCancel} disabled={loading}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <Nav count={totalQuantity}/>
            <Header title="Place Order" modeDisplay="order"/>

            {cartItems.length > 0 ? (
                <div className="orderPage">
                    {/* LEFT SIDE - FORM */}
                    <form className="customerForm-order" onSubmit={handlePlaceOrder}>
                        <h2>Delivery Information</h2>

                        {/* Match PlaceOrderRequest order exactly */}

                        {/* 1. customerName */}
                        <div className="inputContainer">
                            <label>Full Name: <span className="required">*</span></label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* 2. phone */}
                        <div className="inputContainer">
                            <label>Phone: <span className="required">*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0912345678"
                                pattern="^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])\d{7}$"
                                title="Vietnamese phone number (e.g., 0912345678)"
                                required
                            />
                        </div>

                        {/* 3. email */}
                        <div className="inputContainer">
                            <label>Email: <span className="required">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>

                        {/* 4. province */}
                        <div className="inputContainer">
                            <label>Province: <span className="required">*</span></label>
                            <select
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Select Province --</option>
                                {PROVINCES.map(province => (
                                    <option key={province} value={province}>{province}</option>
                                ))}
                            </select>
                        </div>

                        {/* 5. address */}
                        <div className="inputContainer">
                            <label>Address: <span className="required">*</span></label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House number, street, ward, district..."
                                rows="3"
                                required
                            />
                        </div>

                        {/* 6. description */}
                        <div className="inputContainer">
                            <label>Note:</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Special instructions for delivery..."
                                rows="2"
                                maxLength="1000"
                            />
                        </div>

                        {/* 7. paymentMethod */}
                        <div className="inputContainer payment-container">
                            <label>Payment: <span className="required">*</span></label>
                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="CASH"
                                        checked={formData.paymentMethod === "CASH"}
                                        onChange={handlePaymentChange}
                                    />
                                    <span className="payment-icon">💵</span>
                                    <span className="payment-text">Cash on Delivery</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="VNPAY"
                                        checked={formData.paymentMethod === "VNPAY"}
                                        onChange={handlePaymentChange}
                                    />
                                    <span className="payment-icon vnpay">🏦</span>
                                    <span className="payment-text">VNPay</span>
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* RIGHT SIDE - PRODUCTS & CHECKOUT */}
                    <div className="cart-order">
                        <h2>Order Summary ({cartItems.length} items)</h2>

                        <div className="cartItems">
                            {cartItems.map((item) => (
                                <div key={item.cartDetailId} className="cartItem">
                                    <div
                                        className="cart-pic"
                                        style={{backgroundImage: `url(${getImage(item.productList.imageUrl)})`}}
                                    />
                                    <div className="details">
                                        <h3>{item.name}</h3>
                                        <p>Price: {formatPrice(item.productList.price)}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p className="item-subtotal">
                                            Subtotal: {formatPrice(item.productList.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkout Section */}
                        <div className="checkout-section">
                            <div className="totalPrice">
                                <div className="price-row">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="price-row">
                                    <span>Delivery Fee:</span>
                                    <span>{formatPrice(deliveryFee)}</span>
                                </div>
                                <div className="price-row total">
                                    <strong>Total:</strong>
                                    <strong>{formatPrice(total)}</strong>
                                </div>
                            </div>
                            <button
                                type="submit"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="btn-place-order"
                            >
                                {loading ? "Processing..." : "Place Order"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="empty-cart">
                    <p>Your cart is empty. Please add items before placing an order.</p>
                </div>
            )}
        </>
    );
};

export default Order;


