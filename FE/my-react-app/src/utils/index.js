/**
 * Central export file for all utility functions
 * Import from this file for convenience: import { formatPrice, formatDate } from '@/utils'
 */

// Currency utilities
export {
    formatPrice,
    formatPriceWithoutSymbol,
    parsePrice
} from './currencyUtils';

// Date utilities
export {
    formatDate,
    formatDateOnly,
    formatTimeOnly,
    getRelativeTime,
    getCurrentDateTime
} from './dateUtils';

// Validation utilities
export {
    PHONE_REGEX,
    EMAIL_REGEX,
    MIN_PASSWORD_LENGTH,
    isValidPhone,
    isValidEmail,
    isValidPassword,
    passwordsMatch,
    isPasswordDifferent,
    formatPhoneNumber,
    sanitizeInput,
    isRequired,
    minLength,
    maxLength
} from './validationUtils';

// Province utilities
export {
    PROVINCES,
    MAJOR_CITIES,
    calculateDeliveryFee,
    isMajorCity
} from './provinceUtils';

// Image utilities
export {
    getImage,
    getIcon,
    getPlaceholderImage
} from './imageUtils';

// String utilities
export {
    truncateText,
    capitalize,
    titleCase,
    slugify,
    removeVietnameseAccents,
    highlightText
} from './stringUtils';

// Order utilities
export {
    ORDER_STATUS,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
    getStatusColor,
    getStatusText,
    getPaymentStatusColor,
    canCancelOrder
} from './orderUtils';

