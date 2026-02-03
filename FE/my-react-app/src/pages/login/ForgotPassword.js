import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Nav from '../../components/navigation/Nav';
import {useCart} from '../../contexts/CartContext';
import {forgotPassword} from '../../api/AuthAPI';
import {useToast} from '../../components/Toast/Toast';
import './ForgotPassword.scss';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const {cartCount} = useCart();
    const {triggerToast} = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            triggerToast('error', 'Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            triggerToast('error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const result = await forgotPassword(email);

            if (result.success) {
                triggerToast('success', result.message);
                setSubmitted(true);
            } else {
                triggerToast('error', result.message);
            }
        } catch (error) {
            triggerToast('error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <>
                <Nav count={cartCount}/>
                <div className="forgot-password-container">
                    <div className="forgot-password-card">
                        <div className="success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                                      clipRule="evenodd"/>
                            </svg>
                        </div>

                        <h2>Check Your Email</h2>
                        <p className="success-message">
                            We've sent a temporary password to <strong>{email}</strong>.
                        </p>

                        <div className="info-box">
                            <h4>What to do next:</h4>
                            <ol>
                                <li>Check your email inbox (and spam folder)</li>
                                <li>Copy the temporary password from the email</li>
                                <li>Login with your username and the temporary password</li>
                                <li>Change your password immediately after logging in</li>
                            </ol>
                        </div>

                        <div className="actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setSubmitted(false);
                                    setEmail('');
                                }}
                            >
                                Try Another Email
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Nav count={cartCount}/>
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    <div className="lock-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd"
                                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                                  clipRule="evenodd"/>
                        </svg>
                    </div>

                    <h2>Forgot Password</h2>
                    <p className="info-message">
                        Enter your email address and we'll send you a temporary password to reset your account.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Sending...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="additional-links">
                        <button
                            className="link-button"
                            onClick={() => navigate('/login')}
                        >
                            ← Back to Login
                        </button>
                        <button
                            className="link-button"
                            onClick={() => navigate('/verification-help')}
                        >
                            Need verification help?
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
