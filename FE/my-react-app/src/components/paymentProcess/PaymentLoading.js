import React from 'react';

const PaymentLoading = () => {
    return (
        <div className="payment-loading-spinner">
            <div className="payment-spinner"></div>
            <p>Đang xác thực thanh toán...</p>
        </div>
    );
};

export default PaymentLoading;

