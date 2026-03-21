/**
 * Return readable API error message from common axios error shapes.
 */
export const getApiErrorMessage = (error, fallbackMessage) =>
    error?.response?.data?.message || error?.response?.data || fallbackMessage;

