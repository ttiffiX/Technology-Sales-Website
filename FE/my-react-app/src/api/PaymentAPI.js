import apiClient from "./apiClient";

/**
 * Verify VNPay payment callback
 * @param {Object} params - URL params from VNPay redirect
 * @returns {Promise} Payment verification result
 */
export const verifyVNPayPayment = async (params) => {
    try {
        const response = await apiClient.get('/payment/vnpay/callback', { params });
        return response.data;
    } catch (error) {
        console.error('Error verifying VNPay payment:', error);
        throw error;
    }
};


