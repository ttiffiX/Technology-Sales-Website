import apiClient from '../../apiClient';

export const getAttributesByCategory = async (categoryId) => {
    if (!categoryId) {
        return [];
    }

    const response = await apiClient.get(`/pm/category/${categoryId}/attributes`);
    return Array.isArray(response.data) ? response.data : [];
};

export const getAttributeSchemasByCategory = async (categoryId) => {
    if (!categoryId) {
        return [];
    }

    const response = await apiClient.get(`/pm/category/${categoryId}/attributes-schema`);
    return Array.isArray(response.data) ? response.data : [];
};

export const addAttributeSchema = async (categoryId, request) => {
    const response = await apiClient.post(`/pm/category/${categoryId}/attributes-schema`, request);
    return response.data;
};

export const updateAttributeSchema = async (categoryId, request) => {
    const response = await apiClient.put(`/pm/category/${categoryId}/attributes-schema`, request);
    return response.data;
};

export const deleteAttributeSchema = async (attributeId) => {
    const response = await apiClient.delete(`/pm/attributes-schema/${attributeId}`);
    return response.data;
};

