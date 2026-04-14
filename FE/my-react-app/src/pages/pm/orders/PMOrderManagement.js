import React from 'react';
import {
    formatDate,
    formatPrice,
    getPaymentStatusColor,
    getStatusColor,
    ORDER_STATUS_FILTERS,
    PAYMENT_STATUS_FILTERS,
    normalizePMOrderFilterParams,
    normalizePMOrderPageResponse,
} from '../../../utils';
import { useToast } from '../../../components/Toast/Toast';
import PaginationControls from '../../../components/pagination/PaginationControls';
import {
    approvePMOrder,
    completePMOrder,
    // TEMP COMMENT: hide order-status counters to avoid filter misunderstanding.
    // getOrderCountByStatus,
    getPMOrders,
    movePMOrderToShipping,
    rejectPMOrder,
} from '../../../api/pm/order/PMOrderAPI';
import PMOrderDetailModal from './PMOrderDetailModal';
import './PMOrderManagement.scss';

function PMOrderManagement() {
    const { triggerToast } = useToast();
    const triggerToastRef = React.useRef(triggerToast);

    React.useEffect(() => {
        triggerToastRef.current = triggerToast;
    }, [triggerToast]);

    const [statusFilter, setStatusFilter] = React.useState(null);
    // TEMP COMMENT: status counter state is disabled for now.
    // const [statusCounts, setStatusCounts] = React.useState({});
    // const [totalStatusCount, setTotalStatusCount] = React.useState(0);
    // const [isStatusCountLoaded, setIsStatusCountLoaded] = React.useState(false);

    const [orders, setOrders] = React.useState([]);
    const [pageNumber, setPageNumber] = React.useState(0);
    const [pageSize] = React.useState(10);
    const [totalPages, setTotalPages] = React.useState(0);
    const [totalElements, setTotalElements] = React.useState(0);

    const [keywordInput, setKeywordInput] = React.useState('');
    const [appliedKeyword, setAppliedKeyword] = React.useState('');
    const [paymentStatusInput, setPaymentStatusInput] = React.useState('');
    const [appliedPaymentStatus, setAppliedPaymentStatus] = React.useState('');
    const [startDateInput, setStartDateInput] = React.useState('');
    const [endDateInput, setEndDateInput] = React.useState('');
    const [appliedStartDate, setAppliedStartDate] = React.useState('');
    const [appliedEndDate, setAppliedEndDate] = React.useState('');

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    const [actingOrderId, setActingOrderId] = React.useState(null);
    const [selectedOrderId, setSelectedOrderId] = React.useState(null);
    const [showDetailModal, setShowDetailModal] = React.useState(false);

    const loadOrders = React.useCallback(async (nextPage = 0) => {
        setLoading(true);
        setError('');
        try {
            const params = normalizePMOrderFilterParams({
                orderStatus: statusFilter,
                paymentStatus: appliedPaymentStatus,
                keyword: appliedKeyword,
                startDate: appliedStartDate,
                endDate: appliedEndDate,
                page: nextPage,
                size: pageSize,
            });
            const rawData = await getPMOrders(params);
            const pageData = normalizePMOrderPageResponse(rawData);
            const rows = Array.isArray(pageData.content) ? pageData.content : [];

            setOrders(rows);
            setPageNumber(Number.isFinite(pageData.pageNumber) ? pageData.pageNumber : nextPage);
            setTotalPages(Number.isFinite(pageData.totalPages) ? pageData.totalPages : 0);
            setTotalElements(Number.isFinite(pageData.totalElements) ? pageData.totalElements : rows.length);
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to load orders';
            setError(message);
            setOrders([]);
            setTotalPages(0);
            setTotalElements(0);
            triggerToastRef.current('error', message);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, appliedPaymentStatus, appliedKeyword, appliedStartDate, appliedEndDate, pageSize]);

    // TEMP COMMENT: disable status-count fetching until counter UX is clarified.
    // const loadStatusCounts = React.useCallback(async () => {
    //     try {
    //         const data = await getOrderCountByStatus();
    //         setStatusCounts(data.orderStatusCountMap || {});
    //         setTotalStatusCount(data.totalStatusCount ?? 0);
    //         setIsStatusCountLoaded(true);
    //     } catch (_) {
    //         setIsStatusCountLoaded(false);
    //     }
    // }, []);

    React.useEffect(() => {
        loadOrders(pageNumber);
    }, [loadOrders, pageNumber]);

    // TEMP COMMENT: do not auto-load status counters.
    // React.useEffect(() => {
    //     loadStatusCounts();
    // }, [loadStatusCounts]);

    // TEMP COMMENT: counter helper disabled with status counters.
    // const getFilterCount = React.useCallback((statusValue) => {
    //     if (statusValue === null) return totalStatusCount;
    //     return statusCounts?.[statusValue] ?? 0;
    // }, [statusCounts, totalStatusCount]);

    const runAction = async (orderId, action) => {
        setActingOrderId(orderId);
        try {
            const message = await action();
            triggerToast('success', typeof message === 'string' ? message : 'Order updated successfully');
            await loadOrders(pageNumber);
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to update order';
            triggerToast('error', message);
        } finally {
            setActingOrderId(null);
        }
    };

    const handleReject = async (orderId) => {
        const reason = window.prompt('Enter reject reason:', 'Out of stock');
        if (!reason || !reason.trim()) return;
        await runAction(orderId, () => rejectPMOrder(orderId, reason.trim()));
    };

    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setShowDetailModal(true);
    };

    const applySearchFilters = () => {
        if (startDateInput && endDateInput && startDateInput > endDateInput) {
            triggerToast('error', 'Start date must be before or equal to end date');
            return;
        }

        setAppliedKeyword(keywordInput.trim());
        setAppliedPaymentStatus(paymentStatusInput);
        setAppliedStartDate(startDateInput);
        setAppliedEndDate(endDateInput);
        setPageNumber(0);
    };

    const resetSearchFilters = () => {
        setKeywordInput('');
        setAppliedKeyword('');
        setPaymentStatusInput('');
        setAppliedPaymentStatus('');
        setStartDateInput('');
        setEndDateInput('');
        setAppliedStartDate('');
        setAppliedEndDate('');
        setPageNumber(0);
    };

    return (
        <div className="pm-order-management">
            <div className="pm-order-management__header">
                <h2>Order Management</h2>
                <p>View and process customer orders</p>
            </div>

            <div className="pm-order-management__filters">
                {ORDER_STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter.label}
                        type="button"
                        className={`pm-order-management__filter-btn${statusFilter === filter.value ? ' active' : ''}`}
                        onClick={() => {
                            setStatusFilter(filter.value);
                            setPageNumber(0);
                        }}
                    >
                        {filter.label}
                        {/* TEMP COMMENT: hide count badge to avoid misunderstanding while filtering */}
                        {/* {isStatusCountLoaded ? ` (${getFilterCount(filter.value)})` : ''} */}
                    </button>
                ))}
            </div>

            <div className="pm-order-management__search-panel">
                <div className="pm-order-management__search-grid">
                    <input
                        type="text"
                        className="pm-order-management__search-input pm-order-management__search-input--keyword"
                        placeholder="Search by customer name, email, or phone"
                        value={keywordInput}
                        onChange={(event) => setKeywordInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applySearchFilters();
                            }
                        }}
                    />

                    <select
                        className="pm-order-management__search-input"
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
                        className="pm-order-management__search-input"
                        value={startDateInput}
                        onChange={(event) => setStartDateInput(event.target.value)}
                        aria-label="Start date"
                    />

                    <input
                        type="date"
                        className="pm-order-management__search-input"
                        value={endDateInput}
                        onChange={(event) => setEndDateInput(event.target.value)}
                        aria-label="End date"
                    />

                    <button
                        type="button"
                        className="pm-order-management__search-btn"
                        onClick={applySearchFilters}
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        className="pm-order-management__search-btn pm-order-management__search-btn--ghost"
                        onClick={resetSearchFilters}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="pm-order-management__content">
                {loading && <div className="pm-order-management__placeholder">Loading orders...</div>}

                {!loading && error && (
                    <div className="pm-order-management__placeholder pm-order-management__placeholder--error">{error}</div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="pm-order-management__placeholder">
                        {statusFilter ? `No orders with status ${statusFilter}` : 'No orders found'}
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="pm-order-management__list">
                        {orders.map((order) => {
                            const updatedAtValue = order.updatedAt || order.updated_at || order.createdAt;

                            return (
                                <div key={order.id} className="pm-order-management__card">
                                    <div className="pm-order-management__card-head">
                                        <div className="pm-order-management__order-info">
                                            <h3>Order #{order.id}</h3>
                                        </div>

                                        <div className="pm-order-management__times">
                                            <span>
                                                <strong>Created:</strong> {formatDate(order.createdAt) || '-'}
                                            </span>
                                            <span>
                                                <strong>Updated:</strong> {formatDate(updatedAtValue) || '-'}
                                            </span>
                                        </div>

                                        <div className="pm-order-management__badges">
                                            <span className="pm-order-management__badge-label">Order</span>
                                            <span className="pm-order-management__status" style={{ backgroundColor: getStatusColor(order.status) }}>
                                                {order.status || '-'}
                                            </span>
                                            <span className="pm-order-management__badge-label">Payment</span>
                                            <span
                                                className="pm-order-management__payment-status"
                                                style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                                            >
                                                {order.paymentStatus || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pm-order-management__card-body">
                                        <div className="pm-order-management__grid">
                                            <div className="pm-order-management__col">
                                                <div className="pm-order-management__row"><span className="label">Customer:</span><span className="value">{order.customerName || '-'}</span></div>
                                                <div className="pm-order-management__row"><span className="label">Email:</span><span className="value">{order.email || '-'}</span></div>
                                                <div className="pm-order-management__row"><span className="label">Phone:</span><span className="value">{order.phone || '-'}</span></div>
                                                <div className="pm-order-management__row pm-order-management__row--description"><span className="label">Description:</span><span className="value">{order.description?.trim() || '-'}</span></div>
                                            </div>

                                            <div className="pm-order-management__col">
                                                <div className="pm-order-management__row"><span className="label">Payment:</span><span className="value value--primary">{order.paymentMethod || '-'}</span></div>
                                                <div className="pm-order-management__row"><span className="label">Address:</span><span className="value">{order.address || '-'}, {order.province || '-'}</span></div>
                                            </div>
                                        </div>

                                        <div className="pm-order-management__total-box">
                                            <div className="pm-order-management__total-line">
                                                <span>Delivery Fee</span>
                                                <strong>{formatPrice(order.deliveryFee || 0)}</strong>
                                            </div>
                                            <div className="pm-order-management__total-divider" />
                                            <div className="pm-order-management__total-line pm-order-management__total-line--price">
                                                <span>Grand Total</span>
                                                <strong>{formatPrice(order.totalPrice || 0)}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pm-order-management__actions">
                                        <button
                                            type="button"
                                            className="btn-view"
                                            onClick={() => handleViewDetails(order.id)}
                                        >
                                            View Products
                                        </button>

                                        {order.status === 'PENDING' && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-primary"
                                                    disabled={actingOrderId === order.id}
                                                    onClick={() => runAction(order.id, () => approvePMOrder(order.id))}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-danger"
                                                    disabled={actingOrderId === order.id}
                                                    onClick={() => handleReject(order.id)}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'APPROVED' && (
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                disabled={actingOrderId === order.id}
                                                onClick={() => runAction(order.id, () => movePMOrderToShipping(order.id))}
                                            >
                                                Move to Shipping
                                            </button>
                                        )}

                                        {order.status === 'SHIPPING' && (
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                disabled={actingOrderId === order.id}
                                                onClick={() => runAction(order.id, () => completePMOrder(order.id))}
                                            >
                                                Mark Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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

            {showDetailModal && (
                <PMOrderDetailModal
                    orderId={selectedOrderId}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
}

export default PMOrderManagement;

