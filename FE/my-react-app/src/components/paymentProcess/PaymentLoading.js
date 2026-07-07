import React from 'react';

const PaymentLoading = () => {
    return (
        <div className="payment-loading-spinner">
            <div className="payment-spinner"></div>
            <p>Verifying payment transaction...</p>
        </div>
    );
};

export default PaymentLoading;