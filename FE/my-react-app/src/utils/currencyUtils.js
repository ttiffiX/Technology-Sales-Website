/**
 * Format price to Vietnamese currency format
 * @param {number} price - Price to format
 * @returns {string} Formatted price (e.g., "1,000,000 đ")
 */
export const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

/**
 * Format price without currency symbol
 * @param {number} price - Price to format
 * @returns {string} Formatted price (e.g., "1,000,000")
 */
export const formatPriceWithoutSymbol = (price) => {
    if (price === null || price === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Parse formatted price string to number
 * @param {string} formattedPrice - Formatted price string
 * @returns {number} Parsed price
 */
export const parsePrice = (formattedPrice) => {
    if (!formattedPrice) return 0;
    return parseInt(formattedPrice.replace(/[^\d]/g, ''), 10);
};