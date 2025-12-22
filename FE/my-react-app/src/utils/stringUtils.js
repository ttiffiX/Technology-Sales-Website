/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 * @param {string} text - Text to capitalize
 * @returns {string} Title cased text
 */
export const titleCase = (text) => {
    if (!text) return '';
    return text
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
};

/**
 * Convert to slug (URL-friendly string)
 * @param {string} text - Text to convert
 * @returns {string} Slug
 */
export const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Remove Vietnamese accents
 * @param {string} text - Text to process
 * @returns {string} Text without accents
 */
export const removeVietnameseAccents = (text) => {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

/**
 * Highlight search text in string
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @returns {string} HTML string with highlighted matches
 */
export const highlightText = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};

