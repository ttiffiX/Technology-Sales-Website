import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Nav from '../../components/navigation/Nav';
import {useCart} from '../../contexts/CartContext';
import {forgotPassword, verifyResetOtp, resetPassword} from '../../api/AuthAPI';
import {useToast} from '../../components/Toast/Toast';
import OtpInput from '../../components/OtpInput/OtpInput';
import {
    useOtpInput,
    useResendCooldown,
    isOtpComplete,
    joinOtp,
    isValidPassword,
    passwordsMatch,
    MIN_PASSWORD_LENGTH,
    isRequired
} from '../../utils';
import './ForgotPassword.scss';

// ── Step indicator ─────────────────────────────────────────────
const StepIndicator = ({current}) => (
    <div className="step-indicator">
        {['Email', 'Verify OTP', 'New Password'].map((label, i) => {
            const step = i + 1;
            const isActive = step === current;
            const isDone = step < current;
            return (
                <React.Fragment key={step}>
                    <div className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                        <div className="step-circle">{isDone ? '✓' : step}</div>
                        <span className="step-label">{label}</span>
                    </div>
                    {step < 3 && <div className={`step-line ${isDone ? 'done' : ''}`}/>}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Main component ─────────────────────────────────────────────
const ForgotPassword = () => {
    const navigate = useNavigate();
    const {cartCount} = useCart();
    const {triggerToast} = useToast();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({text: '', type: ''});

    // Step 1
    const [email, setEmail] = useState('');

    // Step 2 — dùng shared hook
    const {otp, inputRefs, handleChange, handleKeyDown, handlePaste, resetOtp} = useOtpInput();
    const {cooldown: resendCooldown, startCooldown} = useResendCooldown();

    // Step 3
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwErrors, setPwErrors] = useState({});

    const clearMsg = () => setMessage({text: '', type: ''});

    // ── Step 1: Gửi OTP ────────────────────────────────────────
    const handleSendOtp = async (e) => {
        e.preventDefault();
        clearMsg();
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            triggerToast('error', 'Please enter a valid email address');
            return;
        }
        setLoading(true);
        const result = await forgotPassword(email);
        setLoading(false);
        if (result.success) {
            setStep(2);
            startCooldown(60);
            triggerToast('success', 'OTP sent! Please check your inbox.');
        } else {
            triggerToast('error', result.message);
        }
    };

    // ── Step 2: Xác thực OTP ───────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        clearMsg();
        const otpValue = joinOtp(otp);
        if (!isOtpComplete(otp)) {
            setMessage({text: 'Please enter all 6 OTP digits.', type: 'error'});
            return;
        }
        setLoading(true);
        const result = await verifyResetOtp(email, otpValue);
        setLoading(false);
        if (result.success) {
            setResetToken(result.resetToken);
            setStep(3);
            triggerToast('success', 'OTP verified! Please set your new password.');
        } else {
            setMessage({text: result.message, type: 'error'});
            resetOtp();
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || loading) return;
        clearMsg();
        setLoading(true);
        const result = await forgotPassword(email);
        setLoading(false);
        if (result.success) {
            setMessage({text: 'A new OTP has been sent! Please check your inbox.', type: 'success'});
            startCooldown(60);
            resetOtp();
        } else {
            setMessage({text: result.message, type: 'error'});
        }
    };

    // ── Step 3: validate form ──────────────────────────────────
    const validatePasswordForm = () => {
        const errs = {};
        if (!isRequired(newPassword)) {
            errs.newPassword = 'New password is required';
        } else if (!isValidPassword(newPassword)) {
            errs.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
        }
        if (!isRequired(confirmPassword)) {
            errs.confirmPassword = 'Please confirm your new password';
        } else if (!passwordsMatch(newPassword, confirmPassword)) {
            errs.confirmPassword = 'Passwords do not match';
        }
        setPwErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Step 3: Đặt mật khẩu mới ──────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearMsg();
        setPwErrors({});
        if (!validatePasswordForm()) return;
        setLoading(true);
        const result = await resetPassword(resetToken, newPassword, confirmPassword);
        setLoading(false);
        if (result.success) {
            setMessage({text: 'Password reset successfully! Redirecting to login...', type: 'success'});
            setTimeout(() => navigate('/login'), 2000);
        } else {
            if (result.status === 401) {
                setPwErrors({general: 'Session expired. Please verify your OTP again.'});
                setTimeout(() => {
                    setStep(2);
                    resetOtp();
                    setResetToken('');
                    setPwErrors({});
                    clearMsg();
                }, 2000);
            } else {
                // Set general message trước
                const errs = {general: result.message};
                // Nếu BE trả về errors per-field (vd: { newPassword: "..." }) thì spread vào
                if (result.errors) {
                    Object.assign(errs, result.errors);
                }
                setPwErrors(errs);
            }
        }
    };

    // ── Render ──────────────────────────────────────────────────
    const LockIcon = () => (
        <div className="lock-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                      clipRule="evenodd"/>
            </svg>
        </div>
    );

    return (
        <>
            <Nav count={cartCount}/>
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    <LockIcon/>
                    <StepIndicator current={step}/>

                    {/* ── STEP 1: Nhập email ── */}
                    {step === 1 && (
                        <>
                            <h2>Forgot Password</h2>
                            <p className="info-message">
                                Enter your registered email and we'll send you a 6-digit OTP.
                            </p>
                            <form onSubmit={handleSendOtp}>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email" id="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        disabled={loading} required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                                    {loading ? <><span className="spinner"/>Sending...</> : 'Send OTP'}
                                </button>
                            </form>
                            <div className="additional-links">
                                <button className="link-button" onClick={() => navigate('/login')}>← Back to Login
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 2: Nhập OTP ── */}
                    {step === 2 && (
                        <>
                            <h2>Enter OTP</h2>
                            <p className="info-message">
                                We sent a 6-digit code to <strong>{email}</strong>.<br/>
                                The code expires in <strong>10 minutes</strong>.
                            </p>
                            <form onSubmit={handleVerifyOtp}>
                                <OtpInput
                                    otp={otp}
                                    inputRefs={inputRefs}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    onPaste={handlePaste}
                                    disabled={loading}
                                />
                                {message.text && (
                                    <div className={`fp-message ${message.type}`}>{message.text}</div>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-submit"
                                    disabled={loading || !isOtpComplete(otp)}
                                >
                                    {loading ? <><span className="spinner"/>Verifying...</> : 'Verify OTP'}
                                </button>
                            </form>
                            <div className="resend-row">
                                <span>Didn't receive the code?</span>
                                <button className="btn-resend" onClick={handleResend}
                                        disabled={resendCooldown > 0 || loading}>
                                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                                </button>
                            </div>
                            <div className="additional-links">
                                <button className="link-button" onClick={() => {
                                    setStep(1);
                                    clearMsg();
                                }}>← Change email
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 3: Đặt mật khẩu mới ── */}
                    {step === 3 && (
                        <>
                            <h2>Set New Password</h2>
                            <p className="info-message">
                                OTP verified! Please enter your new password.<br/>
                                <span className="token-warning">⏱ Session expires in 5 minutes.</span>
                            </p>
                            <form onSubmit={handleResetPassword}>
                                {pwErrors.general && (
                                    <div className="fp-message error">{pwErrors.general}</div>
                                )}
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={e => {
                                                setNewPassword(e.target.value);
                                                if (pwErrors.newPassword) setPwErrors(prev => ({
                                                    ...prev,
                                                    newPassword: ''
                                                }));
                                            }}
                                            className={pwErrors.newPassword ? 'error' : ''}
                                            placeholder="Enter your new password"
                                            disabled={loading} required
                                        />
                                    </div>
                                    {pwErrors.newPassword && (
                                        <span className="error-text">{pwErrors.newPassword}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <div className="password-wrapper">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={e => {
                                                setConfirmPassword(e.target.value);
                                                if (pwErrors.confirmPassword) setPwErrors(prev => ({
                                                    ...prev,
                                                    confirmPassword: ''
                                                }));
                                            }}
                                            className={pwErrors.confirmPassword ? 'error' : ''}
                                            placeholder="Re-enter your new password"
                                            disabled={loading} required
                                        />
                                    </div>
                                    {pwErrors.confirmPassword && (
                                        <span className="error-text">{pwErrors.confirmPassword}</span>
                                    )}
                                </div>
                                {message.text && (
                                    <div className={`fp-message ${message.type}`}>{message.text}</div>
                                )}
                                <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                                    {loading ? <><span className="spinner"/>Resetting...</> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
