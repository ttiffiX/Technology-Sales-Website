import apiClient from '../apiClient';

// Total Revenue (dateOption + categoryId)
export const getRevenueTotal = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/total', {params});
    return response.data;
};

// Pending Revenue (dateOption + categoryId)
export const getPendingRevenue = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/pending', {params});
    return response.data;
};

// Cancel Rate (dateOption + categoryId)
export const getRevenueCancelRate = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/cancel-rate', {params});
    return response.data;
};

// LINE CHART: Daily Revenue (date + categoryId) - NO dateOption filter
export const getDailyRevenue = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/daily', {params});
    return response.data;
};

// PIE CHART: Category Revenue Distribution (dateOption only)
export const getCategoryRevenue = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/category', {params});
    return response.data;
};

// BAR CHART: Top Products (dateOption + categoryId + sortBy)
export const getTopProducts = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/top-products', {params});
    return response.data;
};

// PIE CHART: Payment Method Revenue (dateOption + categoryId)
export const getRevenueByPaymentMethod = async (params = {}) => {
    const response = await apiClient.get('/admin/revenue/payment-method', {params});
    return response.data;
};


