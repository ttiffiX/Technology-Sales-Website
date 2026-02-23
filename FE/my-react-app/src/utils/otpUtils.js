/**
 * Utility functions & hook for OTP input logic
 * Dùng chung cho WaitingVerification, ForgotPassword, và bất kỳ flow OTP nào khác
 */
import { useEffect, useRef, useState } from 'react';

export const OTP_LENGTH = 6;

/** Tạo mảng OTP rỗng ban đầu */
export const createEmptyOtp = () => Array(OTP_LENGTH).fill('');

/** Ghép mảng OTP thành chuỗi */
export const joinOtp = (otp) => otp.join('');

/** Kiểm tra OTP đã nhập đủ chưa */
export const isOtpComplete = (otp) => joinOtp(otp).length === OTP_LENGTH;

/**
 * Hook quản lý toàn bộ state & handler cho OTP input
 * @returns { otp, setOtp, inputRefs, handleChange, handleKeyDown, handlePaste, resetOtp }
 */
export const useOtpInput = () => {
    const [otp, setOtp] = useState(createEmptyOtp());
    const inputRefs = useRef([]);

    const handleChange = (index, value) => {
        // Chỉ nhận chữ số
        if (!/^\d*$/.test(value)) return;

        const next = [...otp];

        // Paste cả cụm vào 1 ô
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
            digits.forEach((d, i) => { next[i] = d; });
            setOtp(next);
            inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
            return;
        }

        next[index] = value;
        setOtp(next);

        // Auto-focus ô tiếp theo
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace → lùi về ô trước nếu ô hiện tại trống
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        const next = [...otp];
        pasted.split('').forEach((d, i) => { next[i] = d; });
        setOtp(next);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    /** Reset về trạng thái rỗng và focus ô đầu */
    const resetOtp = () => {
        setOtp(createEmptyOtp());
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
    };

    return { otp, setOtp, inputRefs, handleChange, handleKeyDown, handlePaste, resetOtp };
};

/**
 * Hook đếm ngược cooldown (dùng cho resend OTP)
 * @param {number} initial - Giây ban đầu (mặc định 0)
 * @returns { cooldown, startCooldown }
 */
export const useResendCooldown = (initial = 0) => {
    const [cooldown, setCooldown] = useState(initial);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const startCooldown = (seconds = 60) => setCooldown(seconds);

    return { cooldown, startCooldown };
};

