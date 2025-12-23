import React from 'react';

const PaymentFailed = ({ data, onNavigate }) => {
    const getErrorMessage = (responseCode) => {
        const errorMessages = {
            '07': 'Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
            '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
            '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán',
            '12': 'Thẻ/Tài khoản của khách hàng bị khóa',
            '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
            '24': 'Khách hàng hủy giao dịch',
            '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
            '65': 'Tài khoản của Quý khách đã vượt quá giới hạn số lần giao dịch trong ngày',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Thanh toán không thành công do: Quý khách nhập sai mật khẩu thanh toán quá số lần quy định'
        };

        return errorMessages[responseCode] || 'Giao dịch thất bại. Vui lòng thử lại sau.';
    };

    return (
        <div className="payment-result-container">
            <div className="payment-result-icon failed">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>

            <h1 className="payment-result-title failed">Thanh Toán Thất Bại!</h1>
            <p className="payment-result-message">
                {data?.responseCode ? getErrorMessage(data.responseCode) : (data?.message || 'Đã có lỗi xảy ra trong quá trình thanh toán')}
            </p>

            <div className="payment-result-details">
                <div className="payment-detail-row">
                    <span className="payment-detail-label">Trạng thái</span>
                    <span className="payment-detail-value" style={{ color: '#f5576c' }}>
                        Thất bại
                    </span>
                </div>

                {data?.responseCode && (
                    <div className="payment-detail-row">
                        <span className="payment-detail-label">Mã lỗi</span>
                        <span className="payment-detail-value">{data.responseCode}</span>
                    </div>
                )}
            </div>

            <div className="payment-result-actions">
                <button
                    className="btn-payment-result primary"
                    onClick={() => onNavigate('/cart')}
                >
                    Thử lại
                </button>
                <button
                    className="btn-payment-result secondary"
                    onClick={() => onNavigate('/')}
                >
                    Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default PaymentFailed;

