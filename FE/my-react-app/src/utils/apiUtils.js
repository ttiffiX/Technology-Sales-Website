/**
 * Return readable API error message from common axios error shapes.
 */
export const getApiErrorMessage = (error, fallbackMessage) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data ||
    fallbackMessage;

export const getSuccessMessage = (result, fallback) => result?.message || result || fallback;

/**
 * Map backend validation error payloads to { [field]: message }.
 */
export const mapApiFieldErrors = (error, fallbackMessage) => {
    const errorBody = error?.response?.data;
    const fieldErrors = errorBody?.details?.errors || errorBody?.errors;
    const mapped = {};

    if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach((item) => {
            const field = item?.field;
            const message = item?.defaultMessage || item?.message;
            if (field && message) {
                mapped[field] = message;
            }
        });
    } else if (fieldErrors && typeof fieldErrors === 'object') {
        Object.assign(mapped, fieldErrors);
    }

    if (!Object.keys(mapped).length) {
        mapped.general = getApiErrorMessage(error, fallbackMessage);
    }

    return mapped;
};

