// PlacedOrder.js
import React, {useEffect, useState} from 'react';
import './PlacedOrder.scss';
import Nav from "../../components/navigation/Nav";
import {getCartItems} from "../../api/CartAPI";
import Header from "../../components/header/Header";
import {getOrders, useCancelOrder} from "../../api/OrderAPI";
import {useToast} from "../../components/Toast/Toast";


const PlacedOrder = () => {
    const {totalQuantity} = getCartItems();
    const {orders: initialOrders, orderDetails, loading, error} = getOrders();
    const {cancelOrder} = useCancelOrder();
    const {triggerToast} = useToast();
    const [orders, setOrders] = useState(initialOrders);

    useEffect(() => {
        setOrders(initialOrders); // Khi `initialOrders` thay đổi, cập nhật lại `orders`
    }, [initialOrders]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleCancelOrder = async (orderId) => {
        try {
            const response = await cancelOrder(orderId);
            console.log(response);
            setOrders(orders.map(order => {
                if (order.order_id === orderId) {
                    return {...order, status: 'canceled'}; // Cập nhật trạng thái thành canceled
                }
                return order;
            }));
            // window.location.reload();
            triggerToast("success", response);
        } catch (err) {
            triggerToast("error", err);
        }
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

    return (
        <>
            <Nav count={totalQuantity}/>
            <Header
                title="Ordered"
                modeDisplay="order"
            />
            <div className="placed-order-container">
                {orders.map((order) => {
                    // Lọc ra các orderDetails có order_id trùng với order.orderId
                    const orderItems = orderDetails.filter((item) => item.orderId === order.order_id);

                    return (
                        <div className="outer-grid" key={order.order_id}>
                            <div className="inner-grid">
                                {orderItems.map((item) => (
                                    <div className="product-card" key={item.orderDetailId}>
                                        <div className="product-image"
                                             style={{backgroundImage: `url(${getImage(item.image)})`}}></div>
                                        <div className="product-details">
                                            <h4 className="product-name">{item.name}</h4>
                                            <p className="product-price">Price: {formatPrice(item.price)}</p>
                                            <p className="product-quantity">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Thông tin đơn hàng */}
                            <div className="order-summary">
                                <p>Total Price: <strong>{formatPrice(order.totalPrice)}</strong></p>
                                <p>Status: <strong>{order.status}</strong></p>
                                {order.status === "pending" ? (
                                    <button className="cancel-order-button"
                                            onClick={() => handleCancelOrder(order.order_id)}>
                                        Cancel Order
                                    </button>
                                ) : (
                                    <div/>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

        </>
    );
};

export default PlacedOrder;
