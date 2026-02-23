import React from 'react';
import { OTP_LENGTH } from '../../utils';
import './OtpInput.scss';

/**
 * OtpInput — component 6 ô nhập OTP dùng chung
 *
 * Props:
 *  - otp         : string[]        — mảng 6 ký tự từ useOtpInput()
 *  - inputRefs   : React.MutableRefObject
 *  - onChange    : (index, value) => void
 *  - onKeyDown   : (index, e) => void
 *  - onPaste     : (e) => void
 *  - disabled?   : boolean
 *  - autoFocus?  : boolean (default true)
 */
const OtpInput = ({
    otp,
    inputRefs,
    onChange,
    onKeyDown,
    onPaste,
    disabled = false,
    autoFocus = true,
}) => (
    <div className="otp-input-group" onPaste={onPaste}>
        {otp.map((digit, i) => (
            <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                className={`otp-box${digit ? ' filled' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={OTP_LENGTH}
                value={digit}
                onChange={e => onChange(i, e.target.value)}
                onKeyDown={e => onKeyDown(i, e)}
                disabled={disabled}
                autoFocus={autoFocus && i === 0}
                autoComplete="one-time-code"
            />
        ))}
    </div>
);

export default OtpInput;

