import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendVerificationEmail } from '../../api/AuthAPI';
import Nav from '../../components/navigation/Nav';
import { useCart } from '../../contexts/CartContext';
import './VerificationHelp.scss';

const VerificationHelp = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const [email, setEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Countdown timer effect
    React.useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendEmail = async (e) => {
        e.preventDefault();

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
                setResendCooldown(60);
            } else {
                setMessage({
                    text: result.message || 'Unable to resend email. Please try again later.',
                    type: 'error'
                });

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

    return (
        <>
            <Nav count={cartCount} />
            <div className="verification-help-container">
                <div className="verification-help-card">
                    <div className="help-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                    </div>

                    <h2>Verification Help</h2>
                    <p className="help-description">
                        Having trouble with email verification? Enter your email address below to receive a new verification link.
                    </p>

                    <form onSubmit={handleResendEmail} className="help-form">
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={resendCooldown > 0 || isResending || !email}
                        >
                            {isResending
                                ? 'Sending...'
                                : resendCooldown > 0
                                    ? `Resend (${resendCooldown}s)`
                                    : 'Send Verification Email'}
                        </button>
                    </form>

                    <div className="help-info">
                        <h4>Common Issues:</h4>
                        <ul>
                            <li>Check your spam/junk folder</li>
                            <li>Verification email expires after 30 minutes</li>
                            <li>Unverified accounts are deleted after 24 hours</li>
                        </ul>
                    </div>

                    <div className="help-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate('/register')}
                        >
                            Register New Account
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerificationHelp;
