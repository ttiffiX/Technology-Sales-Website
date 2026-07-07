import React from 'react';
import { formatPrice } from '../../utils';

const PaymentSuccess = ({ data, onNavigate }) => {
    const extractOrderId = (orderInfo) => {
        if (!orderInfo) return null;
        const match = orderInfo.match(/#(\d+)/);
        return match ? match[1] : null;
    };

    const orderId = extractOrderId(data?.orderInfo);

    return (
        <div className="payment-result-container">
            <div className="payment-result-icon success">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="payment-result-title success">Payment Successful!</h1>
            <p className="payment-result-message">
                Your order has been paid successfully. Thank you for shopping with us!
            </p>

            <div className="payment-result-details">
                <div className="payment-detail-row">
                    <span className="payment-detail-label">Transaction ID</span>
                    <span className="payment-detail-value">{data?.txnRef || 'N/A'}</span>
                </div>

                {orderId && (
                    <div className="payment-detail-row">
                        <span className="payment-detail-label">Order Number</span>
                        <span className="payment-detail-value">#{orderId}</span>
                    </div>
                )}

                <div className="payment-detail-row">
                    <span className="payment-detail-label">Amount</span>
                    <span className="payment-detail-value amount">
                        {formatPrice(data?.amount || 0)}
                    </span>
                </div>

                <div className="payment-detail-row">
                    <span className="payment-detail-label">Status</span>
                    <span className="payment-detail-value" style={{ color: '#4caf50' }}>
                        Success
                    </span>
                </div>
            </div>

            <div className="payment-result-actions">
                <button
                    className="btn-payment-result primary"
                    onClick={() => onNavigate('/orderhistory')}
                >
                    View Orders
                </button>
                <button
                    className="btn-payment-result secondary"
                    onClick={() => onNavigate('/')}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;