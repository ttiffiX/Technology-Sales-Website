import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../api/AuthAPI';
import './VerifyEmail.scss';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing.');
            return;
        }

        const verify = async () => {
            try {
                const result = await verifyEmail(token);

                if (result.success) {
                    setStatus('success');
                    setMessage(result.message || 'Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(result.message);
                }
            } catch (error) {
                setStatus('error');
                setMessage('An unexpected error occurred. Please try again.');
            }
        };

        verify();
    }, [searchParams, navigate]);

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleHomeRedirect = () => {
        navigate('/');
    };

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                {status === 'verifying' && (
                    <div className="verify-content">
                        <div className="spinner"></div>
                        <h2>Verifying your email...</h2>
                        <p>Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="verify-content success">
                        <div className="icon-success">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2>Email Đã Được Xác Thực!</h2>
                        <p className="success-message">{message}</p>
                        <div className="close-instruction">
                            <p>✓ Xác thực email thành công</p>
                            <p>✓ Tài khoản của bạn đã được kích hoạt</p>
                            <p className="can-close">Bạn có thể tắt trang này</p>
                        </div>
                        <div className="info-box">
                            <p>Vui lòng quay lại trang đăng ký để tiếp tục đăng nhập.</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="verify-content error">
                        <div className="icon-error">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2>Verification Failed</h2>
                        <p>{message}</p>
                        <div className="button-group">
                            <button
                                className="btn btn-secondary"
                                onClick={handleHomeRedirect}
                            >
                                Go to Home
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleLoginRedirect}
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;

