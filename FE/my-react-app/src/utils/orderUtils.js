/**
 * Order status constants
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    SUCCESS: 'SUCCESS',
    CANCELLED: 'CANCELLED',
    REJECTED: 'REJECTED'
};

/**
 * Payment method constants
 */
export const PAYMENT_METHOD = {
    CASH: 'CASH',
    VNPAY: 'VNPAY'
};

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUND: 'REFUND',
    UNKNOWN: 'UNKNOWN'
};

/**
 * Get status color
 * @param {string} status - Order status
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
    const colors = {
        PENDING: '#FFA500',
        APPROVED: '#1E90FF',
        SUCCESS: '#28a745',
        CANCELLED: '#dc3545',
        REJECTED: '#6c757d'
    };
    return colors[status] || '#6c757d';
};

/**
 * Get status text in Vietnamese
 * @param {string} status - Order status
 * @returns {string} Status text
 */
export const getStatusText = (status) => {
    const texts = {
        PENDING: 'Đang chờ',
        APPROVED: 'Đã duyệt',
        SUCCESS: 'Đã giao',
        CANCELLED: 'Đã hủy',
        REJECTED: 'Từ chối'
    };
    return texts[status] || status;
};

/**
 * Check if order can be cancelled
 * @param {string} status - Order status
 * @returns {boolean} True if can cancel
 */
export const canCancelOrder = (status) => {
    return status === ORDER_STATUS.PENDING;
};

/**
 * Get payment status color
 * @param {string} status - Payment status
 * @returns {string} Color hex code
 */
export const getPaymentStatusColor = (status) => {
    const colors = {
        PENDING: '#FFA500',
        PAID: '#28a745',
        FAILED: '#dc3545',
        REFUND: '#6c757d',
        UNKNOWN: '#6c757d'
    };
    return colors[status] || '#6c757d';
};

