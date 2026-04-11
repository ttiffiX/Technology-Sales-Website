/**
 * Return readable API error message from common axios error shapes.
 */
export const getApiErrorMessage = (error, fallbackMessage) =>
    error?.response?.data?.message || error?.response?.data || fallbackMessage;

export const getSuccessMessage = (result, fallback) => result?.message || result || fallback;

/**
 * Map backend validation error payloads to { [field]: message }.
 */
export const mapApiFieldErrors = (error, fallbackMessage) => {
    const errorBody = error?.response?.data;
    const mapped = {};

    if (Array.isArray(errorBody?.errors)) {
        errorBody.errors.forEach((item) => {
            const field = item?.field;
            const message = item?.defaultMessage || item?.message;
            if (field && message) {
                mapped[field] = message;
            }
        });
    } else if (errorBody?.errors && typeof errorBody.errors === 'object') {
        Object.assign(mapped, errorBody.errors);
    }

    if (!Object.keys(mapped).length) {
        mapped.general = getApiErrorMessage(error, fallbackMessage);
    }

    return mapped;
};

