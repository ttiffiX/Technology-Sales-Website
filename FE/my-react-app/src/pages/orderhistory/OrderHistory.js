import React, {useState} from 'react';
import './OrderHistory.scss';
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import {useGetOrders, useCancelOrder} from "../../api/OrderAPI";
import {useToast} from "../../components/Toast/Toast";
import OrderDetailModal from "./OrderDetailModal";
import {formatDate, formatPrice, getStatusColor} from "../../utils";
import {useGetCartItems} from "../../api/CartAPI";

const OrderHistory = () => {
    const [statusFilter, setStatusFilter] = useState(null);
    const {orders, loading, error} = useGetOrders(statusFilter);
    const {cancelOrder, loading: cancelling} = useCancelOrder();
    const {triggerToast} = useToast();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const {totalQuantity} = useGetCartItems();


    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setShowDetailModal(true);
    };

    const handleCancelClick = (order) => {
        if (order.status !== 'PENDING') {
            triggerToast('error', 'Only pending orders can be cancelled');
            return;
        }
        setOrderToCancel(order);
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = async () => {
        try {
            const response = await cancelOrder(orderToCancel.id);
            triggerToast('success', response.message);
            setShowCancelConfirm(false);
            setOrderToCancel(null);
            window.location.reload(); // Reload to refresh orders
        } catch (err) {
            triggerToast('error', err.message);
        }
    };

    const statusFilters = [
        {value: null, label: 'All Orders'},
        {value: 'PENDING', label: 'Pending'},
        {value: 'APPROVED', label: 'Approved'},
        {value: 'SUCCESS', label: 'Delivered'},
        {value: 'CANCELLED', label: 'Cancelled'},
        {value: 'REJECTED', label: 'Rejected'}
    ];

    return (
        <>
            <Nav count={totalQuantity}/>
            <Header title="Order History" modeDisplay="orderhistory"/>

            <div className="orderHistory">
                {/* Status Filter Tabs */}
                <div className="status-tabs">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.label}
                            className={`tab ${statusFilter === filter.value ? 'active' : ''}`}
                            onClick={() => setStatusFilter(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="orders-container">
                    {loading ? (
                        <div className="loading">Loading orders...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : orders.length === 0 ? (
                        <div className="empty">
                            <p>No orders found</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <h3>Order #{order.id}</h3>
                                        <p className="order-date">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div
                                        className="order-status"
                                        style={{backgroundColor: getStatusColor(order.status)}}
                                    >
                                        {order.status}
                                    </div>
                                </div>

                                <div className="order-body">
                                    <div className="order-details">
                                        <div className="detail-row">
                                            <span className="label">Customer:</span>
                                            <span>{order.customerName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Phone:</span>
                                            <span>{order.phone}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Email:</span>
                                            <span>{order.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Address:</span>
                                            <span>{order.address}, {order.province}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Delivery Fee:</span>
                                            <span>{formatPrice(order.deliveryFee)}</span>
                                        </div>
                                    </div>

                                    <div className="order-total">
                                        <div className="total-label">Total Amount:</div>
                                        <div className="total-price">{formatPrice(order.totalPrice)}</div>
                                    </div>
                                </div>

                                <div className="order-actions">
                                    <button
                                        className="btn-details"
                                        onClick={() => handleViewDetails(order.id)}
                                    >
                                        View Products
                                    </button>
                                    {order.status === 'PENDING' && (
                                        <button
                                            className="btn-cancel"
                                            onClick={() => handleCancelClick(order)}
                                            disabled={cancelling}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {showDetailModal && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setShowDetailModal(false)}
                />
            )}

            {/* Cancel Confirmation */}
            {showCancelConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Cancel Order</h3>
                        <p>Are you sure you want to cancel order #{orderToCancel?.id}?</p>
                        <p className="warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="btn-confirm"
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                            </button>
                            <button
                                className="btn-dismiss"
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={cancelling}
                            >
                                No, Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderHistory;

