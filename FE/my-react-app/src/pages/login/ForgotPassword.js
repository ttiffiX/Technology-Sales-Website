import React from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../../components/navigation/Nav';
import { useCart } from '../../contexts/CartContext';
import './ForgotPassword.scss';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();

    return (
        <>
            <Nav count={cartCount} />
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    <div className="lock-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                        </svg>
                    </div>

                    <h2>Forgot Password</h2>
                    <p className="info-message">
                        This feature is currently under development.
                    </p>

                    <div className="info-box">
                        <h4>Need Help?</h4>
                        <p>If you need to reset your password, please contact our support team.</p>
                        <ul>
                            <li>Email: support@techsales.com</li>
                            <li>Or use the verification help if you haven't verified your email yet</li>
                        </ul>
                    </div>

                    <div className="actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/verification-help')}
                        >
                            Verification Help
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
