import apiClient from '../../apiClient';

export const addCategory = async (name) => {
    const response = await apiClient.post('/pm/category', null, {
        params: { name },
    });
    return response.data;
};

export const updateCategory = async (categoryId, name) => {
    const response = await apiClient.put(`/pm/category/${categoryId}`, null, {
        params: { name },
    });
    return response.data;
};

export const deleteCategory = async (categoryId) => {
    const response = await apiClient.delete(`/pm/category/${categoryId}`);
    return response.data;
};

