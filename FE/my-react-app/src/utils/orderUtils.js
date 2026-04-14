/**
 * Payment method constants
 */
export const PAYMENT_METHOD = {
    CASH: 'CASH',
    VNPAY: 'VNPAY'
};

/**
 * Payment status constants (match BE PaymentStatus enum)
 */
export const PAYMENT_STATUS = {
    REFUND: 'REFUND',
    FAILED: 'FAILED',
    PAID: 'PAID',
    PENDING: 'PENDING',
    REFUND_FAILED: 'REFUND_FAILED'
};

export const PAYMENT_STATUS_FILTERS = [
    { value: '', label: 'All Payment Status' },
    { value: PAYMENT_STATUS.PENDING, label: 'Pending' },
    { value: PAYMENT_STATUS.PAID, label: 'Paid' },
    { value: PAYMENT_STATUS.FAILED, label: 'Failed' },
    { value: PAYMENT_STATUS.REFUND, label: 'Refunded' },
    { value: PAYMENT_STATUS.REFUND_FAILED, label: 'Refund Failed' },
];

export const getStatusColor = (status) => {
    const colors = {
        PENDING: '#FFA500',   // Vàng: Chờ xử lý
        APPROVED: '#0D6EFD',  // Xanh dương: Đã duyệt
        SHIPPING: '#17A2B8',  // Xanh teal: Đang giao (nên đậm hơn xíu so với Cyan)
        REJECTED: '#6C757D',  // Xám: Bị từ chối
        CANCELLED: '#DC3545', // Đỏ: Khách hủy
        COMPLETED: '#28A745'  // Xanh lá: Xong
    };
    return colors[status] || '#6C757D';
};

export const getPaymentStatusColor = (status) => {
    const colors = {
        PENDING: '#FFA500',       // Vàng: Chờ thanh toán
        PAID: '#28A745',          // Xanh lá: Đã thu tiền
        FAILED: '#DC3545',        // Đỏ: Thanh toán lỗi
        REFUND: '#6610F2',        // Tím: Đã hoàn tiền (Dễ phân biệt với các màu khác)
        REFUND_FAILED: '#A52A2A'  // Nâu đỏ: Lỗi hoàn tiền (Cực kỳ nguy hiểm)
    };
    return colors[status] || '#6C757D';
};

/**
 * Shared status filters for customer order history tabs
 */
export const ORDER_STATUS_FILTERS = [
    {value: null, label: 'All Orders'},
    {value: 'PENDING', label: 'Pending'},
    {value: 'APPROVED', label: 'Preparing'},
    {value: 'SHIPPING', label: 'Shipping'},
    {value: 'COMPLETED', label: 'Delivered'},
    {value: 'CANCELLED', label: 'Cancelled'},
    {value: 'REJECTED', label: 'Rejected'}
];

const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizePMOrderPageResponse = (rawData) => {
    const pageData = rawData?.data && typeof rawData.data === 'object' ? rawData.data : rawData;

    if (Array.isArray(pageData)) {
        return {
            content: pageData,
            pageNumber: 0,
            totalPages: 1,
            totalElements: pageData.length,
            pageSize: pageData.length,
        };
    }

    const content = Array.isArray(pageData?.content) ? pageData.content : [];
    const pageMeta = pageData?.page && typeof pageData.page === 'object' ? pageData.page : pageData;

    return {
        content,
        pageNumber: toSafeNumber(pageMeta?.number ?? pageData?.pageNumber, 0),
        totalPages: toSafeNumber(pageMeta?.totalPages ?? pageData?.totalPages, 0),
        totalElements: toSafeNumber(pageMeta?.totalElements ?? pageData?.totalElements, content.length),
        pageSize: toSafeNumber(pageMeta?.size ?? pageData?.pageSize, content.length),
    };
};

export const normalizePMOrderFilterParams = ({
    orderStatus = null,
    paymentStatus = '',
    keyword = '',
    startDate = '',
    endDate = '',
    page = 0,
    size = 10,
} = {}) => {
    const params = {
        page,
        size,
    };

    if (orderStatus) {
        params.orderStatus = String(orderStatus).trim();
    }

    const trimmedPaymentStatus = String(paymentStatus).trim();
    if (trimmedPaymentStatus) {
        params.paymentStatus = trimmedPaymentStatus;
    }

    const trimmedKeyword = String(keyword).trim();
    if (trimmedKeyword) {
        params.keyword = trimmedKeyword;
    }

    const normalizedStartDate = String(startDate).trim();
    if (normalizedStartDate) {
        params.startDate = normalizedStartDate;
    }

    const normalizedEndDate = String(endDate).trim();
    if (normalizedEndDate) {
        params.endDate = normalizedEndDate;
    }

    return params;
};

