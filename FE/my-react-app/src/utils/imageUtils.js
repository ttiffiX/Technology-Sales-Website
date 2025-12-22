/**
 * Get image from assets folder
 * @param {string} imageName - Image filename
 * @returns {string} Image URL or empty string if not found
 */
export const getImage = (imageName) => {
    if (!imageName) return '';

    try {
        return require(`../assets/images/${imageName}`);
    } catch (error) {
        console.warn(`Image not found: ${imageName}`);
        return '';
    }
};

/**
 * Get icon from assets folder
 * @param {string} iconName - Icon filename
 * @returns {string} Icon URL or empty string if not found
 */
export const getIcon = (iconName) => {
    if (!iconName) return '';

    try {
        return require(`../assets/icon/${iconName}`);
    } catch (error) {
        console.warn(`Icon not found: ${iconName}`);
        return '';
    }
};

/**
 * Generate placeholder image URL
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (width = 300, height = 300, text = 'No Image') => {
    return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
};

