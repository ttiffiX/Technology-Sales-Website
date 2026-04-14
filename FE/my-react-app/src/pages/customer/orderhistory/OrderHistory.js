import React, {useEffect, useState} from 'react';
import './OrderHistory.scss';
import Nav from "../../../components/navigation/Nav";
import Header from "../../../components/header/Header";
import {getOrders, useCancelOrder} from "../../../api/customer/OrderAPI";
import {useToast} from "../../../components/Toast/Toast";
import OrderDetailModal from "./OrderDetailModal";
import PaginationControls from "../../../components/pagination/PaginationControls";
import {
    formatDate,
    formatPrice,
    getStatusColor,
    getPaymentStatusColor,
    ORDER_STATUS_FILTERS,
    PAYMENT_STATUS_FILTERS,
    normalizeCustomerOrderFilterParams,
    normalizeCustomerOrderPageResponse,
} from "../../../utils";
import {useCart} from "../../../contexts/CartContext";

const OrderHistory = () => {
    const [statusFilter, setStatusFilter] = useState(null);
    // TEMP COMMENT: hide status-count badges to avoid filter misunderstanding.
    // const [statusCounts, setStatusCounts] = useState({});
    // const [totalStatusCount, setTotalStatusCount] = useState(0);
    // const [isStatusCountLoaded, setIsStatusCountLoaded] = useState(false);

    const [paymentStatusInput, setPaymentStatusInput] = useState('');
    const [appliedPaymentStatus, setAppliedPaymentStatus] = useState('');
    const [startDateInput, setStartDateInput] = useState('');
    const [endDateInput, setEndDateInput] = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');

    const [pageNumber, setPageNumber] = useState(0);
    const pageSize = 10;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const {cancelOrder, loading: cancelling} = useCancelOrder();
    const {triggerToast} = useToast();

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const {cartCount} = useCart();

    const loadOrders = async (nextPage = pageNumber) => {
        try {
            setLoading(true);
            setError('');

            const params = normalizeCustomerOrderFilterParams({
                orderStatus: statusFilter,
                paymentStatus: appliedPaymentStatus,
                startDate: appliedStartDate,
                endDate: appliedEndDate,
                page: nextPage,
                size: pageSize,
            });

            const rawData = await getOrders(params);
            const pageData = normalizeCustomerOrderPageResponse(rawData);
            const rows = Array.isArray(pageData.content) ? pageData.content : [];

            setOrders(rows);
            setPageNumber(Number.isFinite(pageData.pageNumber) ? pageData.pageNumber : nextPage);
            setTotalPages(Number.isFinite(pageData.totalPages) ? pageData.totalPages : 0);
            setTotalElements(Number.isFinite(pageData.totalElements) ? pageData.totalElements : rows.length);
        } catch (err) {
            setOrders([]);
            setTotalPages(0);
            setTotalElements(0);
            setError(err?.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        await loadOrders(pageNumber);
    };

    useEffect(() => {
        loadOrders(pageNumber);
    }, [statusFilter, appliedPaymentStatus, appliedStartDate, appliedEndDate, pageNumber]);


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
            // Save current scroll position
            const scrollPosition = window.scrollY;

            const response = await cancelOrder(orderToCancel.id);

            // Show success message (may include refund info)
            triggerToast('success', response.message || 'Order cancelled successfully');

            // Close modal
            setShowCancelConfirm(false);
            setOrderToCancel(null);

            // Refetch orders to update the list smoothly
            await refetch();
            // TEMP COMMENT: status count refresh is disabled.
            // await fetchStatusCounts();

            // Restore scroll position after a short delay to ensure DOM is updated
            setTimeout(() => {
                window.scrollTo(0, scrollPosition);
            }, 50);
        } catch (err) {
            triggerToast('error', err.message || 'Failed to cancel order');
        }
    };

    // TEMP COMMENT: status-count endpoint is temporarily hidden from UI.
    // const fetchStatusCounts = async () => {
    //     try {
    //         const data = await getOrderCountByStatus();
    //         setStatusCounts(data.orderStatusCountMap || {});
    //         setTotalStatusCount(data.totalStatusCount ?? 0);
    //         setIsStatusCountLoaded(true);
    //     } catch (_err) {
    //         setIsStatusCountLoaded(false);
    //     }
    // };
    // useEffect(() => {
    //     fetchStatusCounts();
    // }, []);
    // const getFilterCount = (statusValue) => {
    //     if (statusValue === null) return totalStatusCount;
    //     return statusCounts?.[statusValue] ?? 0;
    // };

    const applyExtraFilters = () => {
        if (startDateInput && endDateInput && startDateInput > endDateInput) {
            triggerToast('error', 'Start date must be before or equal to end date');
            return;
        }

        setAppliedPaymentStatus(paymentStatusInput);
        setAppliedStartDate(startDateInput);
        setAppliedEndDate(endDateInput);
        setPageNumber(0);
    };

    const resetExtraFilters = () => {
        setPaymentStatusInput('');
        setAppliedPaymentStatus('');
        setStartDateInput('');
        setEndDateInput('');
        setAppliedStartDate('');
        setAppliedEndDate('');
        setPageNumber(0);
    };

    return (
        <>
            <Nav count={cartCount}/>
            <Header title="Order History" modeDisplay="orderhistory"/>

            <div className="orderHistory">
                {/* Status Filter Tabs */}
                <div className="status-tabs">
                    {ORDER_STATUS_FILTERS.map(filter => (
                        <button
                            key={filter.label}
                            className={`tab ${statusFilter === filter.value ? 'active' : ''}`}
                            onClick={() => {
                                setStatusFilter(filter.value);
                                setPageNumber(0);
                            }}
                        >
                            {filter.label}
                            {/* TEMP COMMENT: hide numbers on tabs to avoid filter misunderstanding */}
                            {/* {isStatusCountLoaded ? ` (${getFilterCount(filter.value)})` : ''} */}
                        </button>
                    ))}
                </div>

                <div className="order-filters-panel">
                    <div className="order-filters-grid">
                        <select
                            className="order-filter-input"
                            value={paymentStatusInput}
                            onChange={(event) => setPaymentStatusInput(event.target.value)}
                        >
                            {PAYMENT_STATUS_FILTERS.map((option) => (
                                <option key={option.value || 'all'} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            className="order-filter-input"
                            value={startDateInput}
                            onChange={(event) => setStartDateInput(event.target.value)}
                            aria-label="Start date"
                        />

                        <input
                            type="date"
                            className="order-filter-input"
                            value={endDateInput}
                            onChange={(event) => setEndDateInput(event.target.value)}
                            aria-label="End date"
                        />

                        <button
                            type="button"
                            className="order-filter-btn"
                            onClick={applyExtraFilters}
                        >
                            Apply
                        </button>

                        <button
                            type="button"
                            className="order-filter-btn order-filter-btn--ghost"
                            onClick={resetExtraFilters}
                        >
                            Reset
                        </button>
                    </div>
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
                        orders.map(order => {
                            const updatedAtValue = order.updatedAt || order.updated_at || order.createdAt;

                            return (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <h3>Order #{order.id}</h3>
                                    </div>
                                    <div className="order-times">
                                        <span className="order-time-item">
                                            <span className="time-label">Created:</span>
                                            <span className="time-value">{formatDate(order.createdAt) || '-'}</span>
                                        </span>
                                        <span className="order-time-item">
                                            <span className="time-label">Updated:</span>
                                            <span className="time-value">{formatDate(updatedAtValue) || '-'}</span>
                                        </span>
                                    </div>

                                    <div className="order-badges">
                                        <span className="badge-label">Order</span>
                                        <div
                                            className="order-status"
                                            style={{backgroundColor: getStatusColor(order.status)}}
                                        >
                                            {order.status}
                                        </div>
                                        <span className="badge-label">Payment</span>
                                        <div
                                            className="payment-status"
                                            style={{backgroundColor: getPaymentStatusColor(order.paymentStatus)}}
                                        >
                                            {order.paymentStatus}
                                        </div>
                                    </div>
                                </div>

                                <div className="order-body">
                                    <div className="order-main-grid">
                                        <div className="detail-col detail-col--left">
                                            <div className="detail-row">
                                                <span className="label">Customer:</span>
                                                <span className="value">{order.customerName || '-'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Email:</span>
                                                <span className="value">{order.email || '-'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Phone:</span>
                                                <span className="value">{order.phone || '-'}</span>
                                            </div>
                                            <div className="detail-row detail-row--description">
                                                <span className="label">Description:</span>
                                                <span className="value text-wrap">{order.description?.trim() || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="detail-col detail-col--middle">
                                            <div className="detail-row detail-row--payment">
                                                <span className="label">Payment:</span>
                                                <span className="value payment-method">{order.paymentMethod || '-'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="label">Address:</span>
                                                <span className="value text-wrap">{order.address}, {order.province}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-total">
                                        <div className="total-line">
                                            <span className="total-label">Delivery Fee</span>
                                            <span className="total-sub-price">{formatPrice(order.deliveryFee)}</span>
                                        </div>
                                        <div className="total-divider"/>
                                        <div className="total-price">
                                            <span className="total-label">Grand Total</span>
                                            <span className="price-value">{formatPrice(order.totalPrice)}</span>
                                        </div>
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
                            );
                        })
                    )}
                </div>

                {!loading && !error && (
                    <PaginationControls
                        page={pageNumber}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onPageChange={setPageNumber}
                        disabled={loading}
                    />
                )}
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

