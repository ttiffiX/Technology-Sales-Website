/**
 * Format date to Vietnamese locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date (e.g., "22/12/2025, 10:30")
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format date without time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date (e.g., "22/12/2025")
 */
export const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * Format time only
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted time (e.g., "10:30")
 */
export const formatTimeOnly = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDateOnly(dateString);
};

/**
 * Get current date and time
 * @returns {Object} Current date info
 */
export const getCurrentDateTime = () => {
    const now = new Date();
    return {
        date: now,
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        formatted: formatDate(now),
        dateOnly: formatDateOnly(now)
    };
};

