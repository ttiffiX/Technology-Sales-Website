import apiClient from '../apiClient';

export const getRevenueTotal = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/total', {
        params,
    });
    return response.data;
};

export const getPendingRevenue = async () => {
    const response = await apiClient.get('/admin/revenue/pending');
    return response.data;
};

export const getRevenueCancelRate = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/cancel-rate', {
        params,
    });
    return response.data;
};

export const getRevenueCompare = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/compare', {
        params,
    });
    return response.data;
};

export const getDailyRevenue = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/daily', {
        params,
    });
    return response.data;
};

export const getCategoryRevenue = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/category', {
        params,
    });
    return response.data;
};

export const getTopProducts = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/top-products', {
        params,
    });
    return response.data;
};

export const getRevenueByPaymentMethod = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/payment-method', {
        params,
    });
    return response.data;
};


