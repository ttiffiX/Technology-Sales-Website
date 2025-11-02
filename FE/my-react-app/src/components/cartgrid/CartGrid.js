import React, {useEffect, useState} from 'react';
import './CartGrid.scss';
import {useNavigate} from "react-router-dom";
import {fetchCartItems, removeCartItem, updateItems} from "../../api/CartAPI";
import {useToast} from "../Toast/Toast";

function CartGrid({products, count}) {
    const maxCart = 10;
    const {triggerToast} = useToast();
    const navigate = useNavigate();

    const {incItems, decItems} = updateItems();
    const [localProducts, setLocalProducts] = useState(products);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const {removeItem} = removeCartItem();

    useEffect(() => {
        // Khi `products` thay đổi, cập nhật lại state localProducts
        setLocalProducts(products);
    }, [products]);

    // Hàm định dạng giá (thêm dấu phân cách cho giá)
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ'; // Định dạng giá theo kiểu Việt Nam
    };

    const getImage = (imageName) => {
        try {
            return require(`../../assets/images/${imageName}`);
        } catch (error) {
            return ''; // Trả về đường dẫn mặc định nếu không tìm thấy ảnh
        }
    };

    const PlaceOrder = () => {
        navigate("/checkout");
    }

    const refreshCart = async (action) => {
        try {
            const {cartDTO, totalQuantity} = await fetchCartItems();
            count(totalQuantity);
            if (action === "inc" || action === "dec") {
                const updatedProducts = localProducts.map(product => {
                    const updatedItem = cartDTO.find(items => items.cartId === product.cartId);
                    return updatedItem ? {...product, quantity: updatedItem.quantity} : product;
                });

                setLocalProducts(updatedProducts);
            } else {
                setLocalProducts(cartDTO);
            }
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
        }
    };

    const handleIncrease = async (product_id) => {
        try {
            const {totalQuantity} = await fetchCartItems();
            if (totalQuantity >= maxCart) {
                triggerToast("error", "Too muchhhh!!!")
            } else {
                const response = await incItems(product_id, 1); // Gửi request với số lượng = 1
                console.log(response);

                if (response) {
                    await refreshCart("inc");
                    triggerToast("success", response);
                }
            }
        } catch (err) {
            console.error("Error increasing item:", err);
            triggerToast("error", err);
        }
    }

    const handleDecrease = async (product) => {
        try {
            if (product.quantity <= 1) {
                setProductToDelete(product);
                setShowConfirmPopup(true);
            } else {
                const response = await decItems(product.productId, 1);
                console.log(response);

                if (response) {
                    await refreshCart("dec");
                    triggerToast("success", response);
                }
            }
        } catch (err) {
            console.error("Error reducing item:", err);
            triggerToast("error", err)
        }
    }

    const handleConfirm = async () => {
        try {
            const response = await decItems(productToDelete.productId, 1);
            console.log(response);
            if (response) {
                await refreshCart("");
                triggerToast("success", response);
            }
        } catch (err) {
            console.error("Error reducing item:", err);
            triggerToast("error", err)
        } finally {
            setProductToDelete(null); // Reset sản phẩm cần xóa
            setShowConfirmPopup(false); // Đóng pop-up
        }
    }

    const handleCancel = () => {
        setProductToDelete(null);
        setShowConfirmPopup(false);
    }

    const handleDelete = async (product_id) => {
        try {
            console.log(product_id)
            const response = await removeItem(product_id);
            console.log(response);
            if (response) {
                triggerToast("success", response);
                await refreshCart("");
            }
        } catch (err) {
            console.error("Error removing item:", err);
            triggerToast("success", err);
        }
    }

    const buyNow = () => {
        navigate("/");
    }

    return (
        <>
            {localProducts.length <= 0 && (
                <div className="empty-cart-message">
                    <p>Your cart is empty.</p>
                    <button onClick={buyNow}>Buy Now!</button>
                </div>
            )}
            {showConfirmPopup && (
                <div className="confirm-popup">
                    <div className="popup-content">
                        <p>Are you sure you want to remove from your cart?</p>
                        <div className="popup-actions">
                            <button onClick={handleConfirm}>Yes</button>
                            <button onClick={handleCancel}>No</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="cart-grid">
                {localProducts.length > 0 && (
                    localProducts.map((product) => (
                        <div className="cart-item" key={product.cartId}>
                            <button className="cart-delete-button" onClick={() => handleDelete(product.productId)}>
                                X
                            </button>
                            <div className="cart-pic"
                                 style={{backgroundImage: `url(${getImage(product.image)})`}}></div>
                            <div className={"cart-content"}>
                                <div className="cart-techName">{product.name}</div>
                                <div className="cart-price">{formatPrice(product.price)}</div>
                                <div className="cart-actions">
                                    <button className="quantity-btn" onClick={() => handleDecrease(product)}>-
                                    </button>
                                    <div className="quantity-value">{product.quantity}</div>
                                    <button className="quantity-btn" onClick={() => handleIncrease(product.productId)}>+
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))
                )}
                {localProducts.length > 0 && (
                    <div className="checkout-summary-placeOrder">
                        <div className="header-placeOrder">Total</div>
                        <div className="total-container-placeOrder">
                        <span
                            className="amount-placeOrder">{formatPrice(localProducts.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                        </div>
                        <button className="payment-button-placeOrder" onClick={PlaceOrder}>
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
