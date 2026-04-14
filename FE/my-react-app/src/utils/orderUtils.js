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
