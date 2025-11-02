import React, {useEffect, useState} from 'react';
import './Order.scss';
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import {getCartItems} from "../../api/CartAPI";
import {useToast} from "../../components/Toast/Toast";
import {PlaceOrder} from "../../api/OrderAPI";
import {useNavigate} from "react-router-dom";

const Order = () => {
    const {triggerToast} = useToast();
    const {cartItems, totalQuantity} = getCartItems();
    const {getInfoOrders} = PlaceOrder();
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("Card");
    const navigate = useNavigate();

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

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

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        console.log("Name:", formData.name);
        console.log("Phone:", formData.phone);
        console.log("Address:", formData.address);
        console.log("Payment Method:", paymentMethod);
        setShowConfirmPopup(true);
    };

    const [profile, setProfile] = useState({
        name: "Sang Phạm",  // Tên mặc định từ profile hoặc null
        phone: null, // Số điện thoại từ profile hoặc null
        address: "unknown", // Địa chỉ từ profile hoặc null
    });

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        // Khi profile có dữ liệu, đổ vào form nhưng cho phép sửa
        setFormData({
            name: profile.name || "",
            phone: profile.phone || "",
            address: profile.address || "",
        });
    }, [profile]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleCancel = () => {
        setShowConfirmPopup(false);
    }

    const handleConfirm = async () => {
        // setShowConfirmPopup(true);
        try{
            const response = await getInfoOrders(formData.name, formData.phone, formData.address, paymentMethod);
            console.log(response);
            triggerToast("success", response);
            setShowConfirmPopup(false);
            navigate("/placedorder")
        }catch (err){
            triggerToast("error", err);
        }
    }

    return (
        <>
            {showConfirmPopup && (
                <div className="confirm-popup">
                    <div className="popup-content">
                        <p>Are you sure you want to place order?</p>
                        <div className="popup-actions">
                            <button onClick={handleConfirm}>Yes</button>
                            <button onClick={handleCancel}>No</button>
                        </div>
                    </div>
                </div>
            )}
            <Nav count={totalQuantity}/>;
            <Header
                title="Order"
                modeDisplay="order"
            />
            {cartItems.length > 0 ? (
                <div className={"orderPage"}>
                    {/* Form nhập thông tin khách hàng */}
                    <form className={"customerForm-order"} onSubmit={handlePlaceOrder}>
                        <h2>Delivery Information</h2>
                        <div className={"inputContainer"}>
                            <label>Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                required
                            />
                        </div>
                        <div className={"inputContainer"}>
                            <label>Phone:</label>
                            <input
                                type="tel"
                                maxLength={11}
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone"
                                pattern="^0[0-9]{9,10}$"
                                required
                            />
                        </div>
                        <div className={"inputContainer"}>
                            <label>Address:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Address"
                                required
                            />
                        </div>
                        <div className={"inputContainer"}>
                            <label>Payment Method:</label>
                            <div className="payment-method">
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Card"
                                        checked={paymentMethod === "Card"}
                                        onChange={handlePaymentChange}
                                    />
                                    Card
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Cash"
                                        checked={paymentMethod === "Cash"}
                                        onChange={handlePaymentChange}
                                    />
                                    Cash
                                </label>
                            </div>
                        </div>


                        {/*</form>*/}
                        <div className={"checkout-order"}>
                            <div className={"totalPrice"}>
                                <p>Total
                                    Price(Freeship): {formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p>
                            </div>
                            <button type="submit">Place Order</button>
                        </div>
                    </form>

                    {/* Hiển thị giỏ hàng */}
                    <div className={"cart-order"}>
                        <h2>Products</h2>
                        <div className={"cartItems"}>
                            {cartItems.map((item) => (
                                <div key={item.cartId} className={"cartItem"}>
                                    {/*<img src={item.image} alt={item.name}/>*/}
                                    <div className="cart-pic"
                                         style={{backgroundImage: `url(${getImage(item.image)})`}}></div>
                                    <div className={"details"}>
                                    <h3>{item.name}</h3>
                                        <p>Price: {formatPrice(item.price)}</p>
                                        <p>Quantity: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div/>
            )}
        </>
    );
};

export default Order;
