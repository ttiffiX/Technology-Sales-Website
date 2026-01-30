import React, {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {resendVerificationEmail} from '../../api/AuthAPI';
import './WaitingVerification.scss';

const WaitingVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/register');
        }
    }, [location, navigate]);

    // Countdown timer effect
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendEmail = async () => {
        if (resendCooldown > 0 || isResending || !email) {
            return;
        }

        setIsResending(true);
        setMessage({ text: '', type: '' });

        try {
            const result = await resendVerificationEmail(email);

            if (result.success) {
                setMessage({
                    text: result.message || 'Verification email has been resent! Please check your inbox.',
                    type: 'success'
                });
                setResendCooldown(60); // 60 seconds cooldown
            } else {
                // Display error from backend
                setMessage({
                    text: result.message || 'Unable to resend email. Please try again later.',
                    type: 'error'
                });

                // If rate limit error, set cooldown
                if (result.status === 429) {
                    const match = result.message.match(/(\d+)\s*seconds/);
                    const seconds = match ? parseInt(match[1]) : 60;
                    setResendCooldown(seconds);
                }
            }
        } catch (error) {
            setMessage({
                text: 'Connection error occurred. Please try again later.',
                type: 'error'
            });
        } finally {
            setIsResending(false);
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="waiting-verification-container">
            <div className="waiting-verification-card">
                <div className="waiting-content">
                    <div className="email-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                            <path
                                d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                        </svg>
                    </div>

                    <h2>Email Verification</h2>
                    <p className="main-message">
                        A verification email has been sent to <strong>{email}</strong>
                    </p>
                    <p className="instruction">
                        Please check your inbox and click the verification link to activate your account.
                    </p>

                    <div className="steps-container">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Check Email</h4>
                                <p>Open your inbox</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Click Link</h4>
                                <p>Click the verification link</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Complete</h4>
                                <p>Return to login</p>
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="action-buttons">
                        <button
                            className="btn btn-secondary"
                            onClick={handleResendEmail}
                            disabled={resendCooldown > 0 || isResending || !email}
                        >
                            {isResending
                                ? 'Sending...'
                                : resendCooldown > 0
                                    ? `Resend (${resendCooldown}s)`
                                    : 'Resend Verification Email'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleGoToLogin}
                        >
                            Already Verified? Login Now
                        </button>
                    </div>

                    <div className="note">
                        <p><small>After verifying your email, you can login to the system.</small></p>
                        <p><small>Verification email is valid for 30 minutes. Unverified accounts will be deleted after 24 hours.</small></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingVerification;

