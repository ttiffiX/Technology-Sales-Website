import apiClient from './apiClient';

export const getAdminUsers = async () => {
    const response = await apiClient.get('/admin/users');
    return Array.isArray(response.data) ? response.data : [];
};

export const getAdminRoles = async () => {
    const response = await apiClient.get('/admin/roles');
    return Array.isArray(response.data) ? response.data : [];
};

export const addAdminUser = async (request) => {
    const response = await apiClient.post('/admin/users', request);
    return response.data;
};

export const updateAdminUserRole = async (id, role) => {
    const response = await apiClient.patch(`/admin/users/${id}/role`, role);
    return response.data;
};

export const updateAdminUserBanStatus = async (id, status) => {
    const response = await apiClient.patch(`/admin/users/${id}/ban`, null, {
        params: { status },
    });
    return response.data;
};

export const deleteAdminUser = async (id, adminPassword) => {
    const response = await apiClient.delete(`/admin/users/${id}`, {
        data: { adminPassword },
    });
    return response.data;
};

export const searchAdminUsers = async (keyword) => {
    if (!keyword || keyword.trim() === '') {
        return [];
    }
    const response = await apiClient.get('/admin/users/search', {
        params: { keyword: keyword.trim() },
    });
    return Array.isArray(response.data) ? response.data : [];
};

export const filterAdminUsersByRole = async (role) => {
    if (!role) {
        return [];
    }
    const response = await apiClient.get('/admin/users/filter/role', {
        params: { role },
    });
    return Array.isArray(response.data) ? response.data : [];
};

