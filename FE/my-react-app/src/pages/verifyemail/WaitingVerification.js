import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resendVerificationEmail, verifyEmail } from '../../api/AuthAPI';
import OtpInput from '../../components/OtpInput/OtpInput';
import { useOtpInput, useResendCooldown, isOtpComplete, joinOtp } from '../../utils';
import './WaitingVerification.scss';

const WaitingVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // ── Dùng shared hook ───────────────────────────────────────
    const { otp, inputRefs, handleChange, handleKeyDown, handlePaste, resetOtp } = useOtpInput();
    const { cooldown: resendCooldown, startCooldown } = useResendCooldown();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/register');
        }
    }, [location, navigate]);

    // ─── Xác thực OTP ─────────────────────────────────────────
    const handleVerify = async () => {
        const otpValue = joinOtp(otp);
        if (!isOtpComplete(otp)) {
            setMessage({ text: 'Please enter all 6 OTP digits.', type: 'error' });
            return;
        }
        setIsVerifying(true);
        setMessage({ text: '', type: '' });
        const result = await verifyEmail(email, otpValue);
        if (result.success) {
            setMessage({ text: 'Verification successful! Redirecting to login...', type: 'success' });
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setMessage({ text: result.message, type: 'error' });
            resetOtp();
        }
        setIsVerifying(false);
    };

    // ─── Gửi lại OTP ──────────────────────────────────────────
    const handleResend = async () => {
        if (resendCooldown > 0 || isResending || !email) return;
        setIsResending(true);
        setMessage({ text: '', type: '' });
        const result = await resendVerificationEmail(email);
        if (result.success) {
            setMessage({ text: 'A new OTP has been sent! Please check your inbox.', type: 'success' });
            startCooldown(60);
            resetOtp();
        } else {
            setMessage({ text: result.message, type: 'error' });
            if (result.status === 429) {
                const match = result.message.match(/(\d+)\s*seconds/);
                startCooldown(match ? parseInt(match[1]) : 60);
            }
        }
        setIsResending(false);
    };

    return (
        <div className="waiting-verification-container">
            <div className="waiting-verification-card">
                <div className="waiting-content">
                    <div className="email-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                        </svg>
                    </div>

                    <h2>Email Verification</h2>
                    <p className="main-message">
                        An OTP code has been sent to <strong>{email}</strong>
                    </p>
                    <p className="instruction">
                        Enter the 6-digit code from your email to activate your account. The code is valid for <strong>10 minutes</strong>.
                    </p>

                    {/* Dùng component chung */}
                    <OtpInput
                        otp={otp}
                        inputRefs={inputRefs}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        disabled={isVerifying}
                    />

                    {message.text && (
                        <div className={`message ${message.type}`}>{message.text}</div>
                    )}

                    <button
                        className="btn btn-primary btn-verify"
                        onClick={handleVerify}
                        disabled={isVerifying || !isOtpComplete(otp)}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="resend-section">
                        <span>Didn't receive the code? </span>
                        <button
                            className="btn-resend"
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || isResending}
                        >
                            {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code'}
                        </button>
                    </div>

                    <div className="note">
                        <p><small>OTP is valid for 10 minutes. Unverified accounts will be deleted after 24 hours.</small></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitingVerification;
