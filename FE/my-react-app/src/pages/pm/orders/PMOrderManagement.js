import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    formatDate,
    formatPrice,
    getPaymentStatusColor,
    getStatusColor,
    ORDER_STATUS_FILTERS,
    PAYMENT_STATUS_FILTERS,
    normalizePMOrderFilterParams,
    normalizePMOrderPageResponse, getInitialValue, getInitialPage,
} from '../../../utils';
import { useToast } from '../../../components/Toast/Toast';
import PaginationControls from '../../../components/pagination/PaginationControls';
import {
    approvePMOrder,
    completePMOrder,
    getPMOrders,
    movePMOrderToShipping,
    rejectPMOrder,
} from '../../../api/pm/order/PMOrderAPI';
import PMOrderDetailModal from './PMOrderDetailModal';
import './PMOrderManagement.scss';

function PMOrderManagement() {
    const { triggerToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const triggerToastRef = useRef(triggerToast);
    useEffect(() => {
        triggerToastRef.current = triggerToast;
    }, [triggerToast]);

    // Các cờ (Ref) để kiểm soát vòng đời tải trang y hệt PMReview
    const hasFetchedInitialDataRef = useRef(false);
    const hasSyncedInitialStateRef = useRef(false);
    const initialSearchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    // --- STATES TỪ URL ---
    const [statusFilter, setStatusFilter] = useState(getInitialValue(initialSearchParams, 'status', null));

    const [keywordInput, setKeywordInput] = useState(getInitialValue(initialSearchParams, 'keyword'));
    const [appliedKeyword, setAppliedKeyword] = useState(getInitialValue(initialSearchParams, 'keyword'));

    const [paymentStatusInput, setPaymentStatusInput] = useState(getInitialValue(initialSearchParams, 'paymentStatus'));
    const [appliedPaymentStatus, setAppliedPaymentStatus] = useState(getInitialValue(initialSearchParams, 'paymentStatus'));

    const [startDateInput, setStartDateInput] = useState(getInitialValue(initialSearchParams, 'startDate'));
    const [appliedStartDate, setAppliedStartDate] = useState(getInitialValue(initialSearchParams, 'startDate'));

    const [endDateInput, setEndDateInput] = useState(getInitialValue(initialSearchParams, 'endDate'));
    const [appliedEndDate, setAppliedEndDate] = useState(getInitialValue(initialSearchParams, 'endDate'));

    const [appliedId, setAppliedId] = useState(getInitialValue(initialSearchParams, 'id'));

    const [pageNumber, setPageNumber] = useState(() => getInitialPage(initialSearchParams));

    // --- STATES DỮ LIỆU ---
    const [orders, setOrders] = useState([]);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [actingOrderId, setActingOrderId] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // ==========================================
    // 1. HÀM TẢI DỮ LIỆU TỪ API
    // ==========================================
    const loadOrders = async (nextPage = pageNumber) => {
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
            if (appliedId) {
                params.id = appliedId;
            }
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
    };

    // ==========================================
    // 2. HÀM ĐỒNG BỘ URL
    // ==========================================
    const syncListUrl = (nextState = {}) => {
        const params = new URLSearchParams();
        const nextKeyword = String(nextState.keyword ?? appliedKeyword).trim();
        const nextPayment = String(nextState.paymentStatus ?? appliedPaymentStatus).trim();
        const nextStart = String(nextState.startDate ?? appliedStartDate).trim();
        const nextEnd = String(nextState.endDate ?? appliedEndDate).trim();
        const nextId = String(nextState.id ?? appliedId).trim();
        const nextStatus = String(nextState.status ?? statusFilter).trim();
        const nextPage = Number.isFinite(nextState.page) ? nextState.page : pageNumber;

        if (nextKeyword) params.set('keyword', nextKeyword);
        if (nextPayment) params.set('paymentStatus', nextPayment);
        if (nextStart) params.set('startDate', nextStart);
        if (nextEnd) params.set('endDate', nextEnd);
        if (nextId) params.set('id', nextId);
        if (nextStatus && nextStatus !== 'null') params.set('status', nextStatus);
        if (Number.isFinite(nextPage) && nextPage > 0) params.set('page', String(nextPage));

        navigate(
            {
                pathname: '/pm/orders',
                search: params.toString() ? `?${params.toString()}` : '',
            },
            { replace: true }
        );
    };

    // ==========================================
    // 3. LẮNG NGHE URL ĐỂ BẮT SỰ KIỆN CLICK NOTIFICATION
    // ==========================================
    useEffect(() => {
        const currentUrlParams = new URLSearchParams(location.search);
        const idFromUrl = currentUrlParams.get('id') || '';

        // Khi người dùng click chuông thông báo
        if (idFromUrl !== appliedId) {
            // Xóa sạch bộ lọc cũ để tránh xung đột (VD: xóa status đang lọc)
            setKeywordInput('');
            setPaymentStatusInput('');
            setStartDateInput('');
            setEndDateInput('');

            setAppliedKeyword('');
            setAppliedPaymentStatus('');
            setAppliedStartDate('');
            setAppliedEndDate('');
            setStatusFilter(null); // QUAN TRỌNG: Phải xóa status để không bị trùng filter

            setAppliedId(idFromUrl);
            setPageNumber(0);
        }
    }, [location.search]);

    // ==========================================
    // 4. KIỂM SOÁT VÒNG ĐỜI VÀ GỌI API
    // ==========================================
    useEffect(() => {
        if (hasFetchedInitialDataRef.current) return;
        hasFetchedInitialDataRef.current = true;
        loadOrders(pageNumber);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hasFetchedInitialDataRef.current) return;
        if (!hasSyncedInitialStateRef.current) {
            hasSyncedInitialStateRef.current = true;
            syncListUrl();
            return;
        }

        syncListUrl();
        loadOrders(pageNumber);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedKeyword, appliedPaymentStatus, appliedStartDate, appliedEndDate, appliedId, statusFilter, pageNumber]);


    // --- HÀM XỬ LÝ SỰ KIỆN NÚT BẤM ---

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

        // Khi user tự thực hiện tìm kiếm tay, tắt force ID để tìm kiếm rộng rãi
        setAppliedId('');
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
        setAppliedId('');
        setStatusFilter(null); // Reset luôn tab trạng thái
        setPageNumber(0);

        // Khôi phục lại hàm navigate để dọn dẹp thanh URL
        navigate('/pm/orders', { replace: true });
    };

    return (
        <div className="pm-order-management">
            <div className="pm-order-management__header">
                <h2>Order Management</h2>
                <p>View and process customer orders</p>
                {/* Thông báo phụ nếu đang lọc đích danh theo ID */}
                {appliedId &&
                    <p style={{color: '#0284c7', fontSize: '14px', marginTop: '4px'}}>Showing direct result for Order
                        ID: #{appliedId}</p>}
            </div>

            <div className="pm-order-management__filters">
                {ORDER_STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter.label}
                        type="button"
                        className={`pm-order-management__filter-btn${statusFilter === filter.value ? ' active' : ''}`}
                        onClick={() => {
                            // Xóa ID nếu người dùng click lại vào các tab trạng thái
                            setAppliedId('');
                            setStatusFilter(filter.value);
                            setPageNumber(0);
                        }}
                    >
                        {filter.label}
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
                    <div
                        className="pm-order-management__placeholder pm-order-management__placeholder--error">{error}</div>
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
                                            <span className="pm-order-management__status"
                                                  style={{backgroundColor: getStatusColor(order.status)}}>
                                                {order.status || '-'}
                                            </span>
                                            <span className="pm-order-management__badge-label">Payment</span>
                                            <span
                                                className="pm-order-management__payment-status"
                                                style={{backgroundColor: getPaymentStatusColor(order.paymentStatus)}}
                                            >
                                                {order.paymentStatus || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pm-order-management__card-body">
                                        <div className="pm-order-management__grid">
                                            <div className="pm-order-management__col">
                                                <div className="pm-order-management__row"><span
                                                    className="label">Customer:</span><span
                                                    className="value">{order.customerName || '-'}</span></div>
                                                <div className="pm-order-management__row"><span
                                                    className="label">Email:</span><span
                                                    className="value">{order.email || '-'}</span></div>
                                                <div className="pm-order-management__row"><span
                                                    className="label">Phone:</span><span
                                                    className="value">{order.phone || '-'}</span></div>
                                                <div
                                                    className="pm-order-management__row pm-order-management__row--description">
                                                    <span className="label">Description:</span><span
                                                    className="value">{order.description?.trim() || '-'}</span></div>
                                            </div>

                                            <div className="pm-order-management__col">
                                                <div className="pm-order-management__row"><span
                                                    className="label">Payment:</span><span
                                                    className="value value--primary">{order.paymentMethod || '-'}</span>
                                                </div>
                                                <div className="pm-order-management__row"><span
                                                    className="label">Address:</span><span
                                                    className="value">{order.address || '-'}, {order.province || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pm-order-management__total-box">
                                            <div className="pm-order-management__total-line">
                                                <span>Delivery Fee</span>
                                                <strong>{formatPrice(order.deliveryFee || 0)}</strong>
                                            </div>
                                            <div className="pm-order-management__total-divider"/>
                                            <div
                                                className="pm-order-management__total-line pm-order-management__total-line--price">
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