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

/**
 * Get status color
 * @param {string} status - Order status
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
    const colors = {
        PENDING: '#FFA500',
        APPROVED: '#1E90FF',
        SHIPPING: '#17a2b8',
        REJECTED: '#6c757d',
        CANCELLED: '#dc3545',
        COMPLETED: '#28a745'
    };
    return colors[status] || '#6c757d';
};

/**
 * Get payment status color
 * @param {string} status - Payment status
 * @returns {string} Color hex code
 */
export const getPaymentStatusColor = (status) => {
    const colors = {
        REFUND: '#6c757d',
        FAILED: '#dc3545',
        PAID: '#28a745',
        PENDING: '#FFA500',
        REFUND_FAILED: '#b02a37'
    };
    return colors[status] || '#6c757d';
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
