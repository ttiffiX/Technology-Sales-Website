import React from 'react';

const PaymentFailed = ({ data, onNavigate }) => {
    const getErrorMessage = (responseCode) => {
        const errorMessages = {
            '07': 'Suspected transaction (suspected fraud or unusual activity)',
            '09': 'Customer card/account is not registered for Internet Banking',
            '10': 'Customer failed verification more than 3 times',
            '11': 'Payment timeout expired',
            '12': 'Customer card/account is locked',
            '13': 'Incorrect One-Time Password (OTP) entered',
            '24': 'Transaction cancelled by customer',
            '51': 'Insufficient account balance to complete transaction',
            '65': 'Transaction limit exceeded for the day',
            '75': 'The payment gateway bank is undergoing maintenance',
            '79': 'Payment failed: Maximum password retry limit exceeded'
        };

        return errorMessages[responseCode] || 'Transaction failed. Please try again later.';
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-icon failed">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>

            <h1 className="payment-result-title failed">Payment Failed!</h1>
            <p className="payment-result-message">
                {data?.responseCode ? getErrorMessage(data.responseCode) : (data?.message || 'An error occurred during the payment process')}
            </p>

            <div className="payment-result-details">
                <div className="payment-detail-row">
                    <span className="payment-detail-label">Status</span>
                    <span className="payment-detail-value" style={{ color: '#f5576c' }}>
                        Failed
                    </span>
                </div>

                {data?.responseCode && (
                    <div className="payment-detail-row">
                        <span className="payment-detail-label">Error Code</span>
                        <span className="payment-detail-value">{data.responseCode}</span>
                    </div>
                )}
            </div>

            <div className="payment-result-actions">
                <button
                    className="btn-payment-result primary"
                    onClick={() => onNavigate('/cart')}
                >
                    Try Again
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

export default PaymentFailed;