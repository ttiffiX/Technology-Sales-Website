/**
 * Vietnamese phone number regex
 * Supports formats: 0912345678, +84912345678, 84912345678
 */
export const PHONE_REGEX = /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/;

/**
 * Email regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password minimum length
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
    if (!phone) return false;
    return PHONE_REGEX.test(phone.trim());
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate password length
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export const isValidPassword = (password) => {
    if (!password) return false;
    return password.length >= MIN_PASSWORD_LENGTH;
};

/**
 * Check if two passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Second password
 * @returns {boolean} True if they match
 */
export const passwordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};

/**
 * Check if new password is different from old password
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {boolean} True if they are different
 */
export const isPasswordDifferent = (oldPassword, newPassword) => {
    return oldPassword !== newPassword;
};

/**
 * Format phone number to standard format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone (e.g., "+84 912 345 678")
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Convert to +84 format
    if (cleaned.startsWith('0')) {
        cleaned = '84' + cleaned.substring(1);
    }

    if (!cleaned.startsWith('84')) {
        return phone; // Return original if invalid
    }

    // Format as +84 912 345 678
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
    if (!input) return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
};

/**
 * Validate min length
 * @param {string} value - Value to check
 * @param {number} min - Minimum length
 * @returns {boolean} True if valid
 */
export const minLength = (value, min) => {
    if (!value) return false;
    return value.length >= min;
};

/**
 * Validate max length
 * @param {string} value - Value to check
 * @param {number} max - Maximum length
 * @returns {boolean} True if valid
 */
export const maxLength = (value, max) => {
    if (!value) return true;
    return value.length <= max;
};

