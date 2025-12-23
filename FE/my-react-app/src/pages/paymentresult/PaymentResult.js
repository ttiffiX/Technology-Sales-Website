import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyVNPayPayment } from '../../api/PaymentAPI';
import { useToast } from '../../components/Toast/Toast';
import PaymentSuccess from '../../components/paymentProcess/PaymentSuccess';
import PaymentFailed from '../../components/paymentProcess/PaymentFailed';
import PaymentLoading from '../../components/paymentProcess/PaymentLoading';
import './PaymentResult.scss';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { triggerToast } = useToast();
    const [paymentStatus, setPaymentStatus] = useState('loading');
    const [paymentData, setPaymentData] = useState(null);
    const hasVerified = useRef(false); // Prevent duplicate verification

    useEffect(() => {
        // Only verify once
        if (hasVerified.current) return;

        const verifyPayment = async () => {
            try {
                // Convert URLSearchParams to object
                const params = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                // Check if we have payment params
                if (!params.vnp_ResponseCode) {
                    navigate('/');
                    return;
                }

                // Mark as verified
                hasVerified.current = true;

                // Verify payment with backend
                const result = await verifyVNPayPayment(params);

                if (result.success) {
                    setPaymentStatus('success');
                    setPaymentData(result);
                    triggerToast('success', 'Thanh toán thành công!');
                } else {
                    setPaymentStatus('failed');
                    setPaymentData(result);
                    triggerToast('error', 'Thanh toán thất bại!');
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
                setPaymentStatus('failed');
                setPaymentData({
                    success: false,
                    message: 'Lỗi xác thực thanh toán'
                });
                triggerToast('error', 'Lỗi xác thực thanh toán!');
            }
        };

        verifyPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="payment-result">
            {paymentStatus === 'loading' && <PaymentLoading />}
            {paymentStatus === 'success' && (
                <PaymentSuccess
                    data={paymentData}
                    onNavigate={handleNavigate}
                />
            )}
            {paymentStatus === 'failed' && (
                <PaymentFailed
                    data={paymentData}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    );
};

export default PaymentResult;

