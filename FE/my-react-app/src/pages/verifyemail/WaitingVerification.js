import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WaitingVerification.scss';

const WaitingVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/register');
        }
    }, [location, navigate]);

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="waiting-verification-container">
            <div className="waiting-verification-card">
                <div className="waiting-content">
                    <div className="email-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                        </svg>
                    </div>

                    <h2>Xác Thực Email</h2>
                    <p className="main-message">
                        Một email xác thực đã được gửi đến <strong>{email}</strong>
                    </p>
                    <p className="instruction">
                        Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác thực để kích hoạt tài khoản.
                    </p>

                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Kiểm tra email</h4>
                                <p>Mở hộp thư của bạn</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Click vào link</h4>
                                <p>Nhấp vào liên kết xác thực</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Hoàn tất</h4>
                                <p>Quay lại để đăng nhập</p>
                            </div>
                        </div>
                    </div>

                    {resendMessage && (
                        <div className="status-message">
                            {resendMessage}
                        </div>
                    )}

                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={handleGoToLogin}
                        >
                            Đã xác thực? Đăng nhập ngay
                        </button>
                    </div>

                    <div className="note">
                        <p><small>Sau khi xác thực email, bạn có thể đăng nhập vào hệ thống.</small></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingVerification;

