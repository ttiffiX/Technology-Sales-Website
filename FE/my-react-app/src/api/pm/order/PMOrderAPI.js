import apiClient from '../../apiClient';

export const getPMOrders = async (status = null) => {
    const response = await apiClient.get('/pm/orders', {
        params: status ? {status} : undefined,
    });
    return Array.isArray(response.data) ? response.data : [];
};

export const getOrderCountByStatus = async () => {
    const response = await apiClient.get('/pm/orders/status-count');
    const data = response.data || {};

    return {
        orderStatusCountMap: data.orderStatusCountMap || {},
        totalStatusCount: data.totalStatusCount ?? 0,
    };
};

export const getPMOrderDetails = async (orderId) => {
    const response = await apiClient.get(`/pm/orders/${orderId}`);
    return Array.isArray(response.data) ? response.data : [];
};

export const getOrderDetail = async (orderId) => {
    const response = await apiClient.get(`/pm/orders/${orderId}`);
    return Array.isArray(response.data) ? response.data : [];
};

export const approvePMOrder = async (orderId) => {
    const response = await apiClient.patch(`/pm/orders/${orderId}/approve`);
    return response.data;
};

export const rejectPMOrder = async (orderId, reason) => {
    const response = await apiClient.patch(`/pm/orders/${orderId}/reject`, null, {
        params: {reason},
    });
    return response.data;
};

export const movePMOrderToShipping = async (orderId) => {
    const response = await apiClient.patch(`/pm/orders/${orderId}/shipping`);
    return response.data;
};

export const completePMOrder = async (orderId) => {
    const response = await apiClient.patch(`/pm/orders/${orderId}/complete`);
    return response.data;
};

