import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resendVerificationEmail, verifyEmail } from '../../api/AuthAPI';
import './WaitingVerification.scss';

const WaitingVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');

    // 6 ô OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            navigate('/register');
        }
    }, [location, navigate]);

    // Đếm ngược cooldown resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // ─── Xử lý nhập OTP ───────────────────────────────────────
    const handleOtpChange = (index, value) => {
        // Chỉ nhận chữ số
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];

        // Cho phép paste cả 6 số vào ô đầu tiên
        if (value.length > 1) {
            const digits = value.slice(0, 6).split('');
            digits.forEach((d, i) => { newOtp[i] = d; });
            setOtp(newOtp);
            const nextFocus = Math.min(digits.length, 5);
            inputRefs.current[nextFocus]?.focus();
            return;
        }

        newOtp[index] = value;
        setOtp(newOtp);

        // Tự động nhảy sang ô tiếp theo
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pasted.split('').forEach((d, i) => { newOtp[i] = d; });
        setOtp(newOtp);
        const nextFocus = Math.min(pasted.length, 5);
        inputRefs.current[nextFocus]?.focus();
    };

    // ─── Xác thực OTP ─────────────────────────────────────────
    const handleVerify = async () => {
        const otpValue = otp.join('');
        if (otpValue.length < 6) {
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
            // Xóa các ô OTP khi sai
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
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
            setResendCooldown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } else {
            setMessage({ text: result.message, type: 'error' });
            if (result.status === 429) {
                const match = result.message.match(/(\d+)\s*seconds/);
                setResendCooldown(match ? parseInt(match[1]) : 60);
            }
        }
        setIsResending(false);
    };

    return (
        <div className="waiting-verification-container">
            <div className="waiting-verification-card">
                <div className="waiting-content">

                    {/* Icon */}
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

                    {/* 6 ô nhập OTP */}
                    <div className="otp-input-group" onPaste={handleOtpPaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                className="otp-input"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {/* Thông báo */}
                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Nút xác thực */}
                    <button
                        className="btn btn-primary btn-verify"
                        onClick={handleVerify}
                        disabled={isVerifying || otp.join('').length < 6}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    {/* Gửi lại */}
                    <div className="resend-section">
                        <span>Didn't receive the code? </span>
                        <button
                            className="btn-resend"
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || isResending}
                        >
                            {isResending
                                ? 'Sending...'
                                : resendCooldown > 0
                                    ? `Resend (${resendCooldown}s)`
                                    : 'Resend code'}
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
