import apiClient from '../../apiClient';

export const getAttributesByCategory = async (categoryId) => {
    if (!categoryId) {
        return [];
    }

    const response = await apiClient.get(`/pm/category-attributes/category/${categoryId}`);
    return Array.isArray(response.data) ? response.data : [];
};

export const getAttributeSchemasByCategory = async (categoryId) => {
    if (!categoryId) {
        return [];
    }

    const response = await apiClient.get(`/pm/category-attributes/category/${categoryId}/schemas`);
    return Array.isArray(response.data) ? response.data : [];
};

export const addAttributeSchema = async (categoryId, request) => {
    const response = await apiClient.post(`/pm/category-attributes/category/${categoryId}`, request);
    return response.data;
};

export const updateAttributeSchema = async (attributeId, request) => {
    const response = await apiClient.put(`/pm/category-attributes/${attributeId}`, request);
    return response.data;
};

export const deleteAttributeSchema = async (attributeId) => {
    const response = await apiClient.delete(`/pm/category-attributes/${attributeId}`);
    return response.data;
};

export const updateAttributeDisplayOrder = async (groupId, attributeIds) => {
    const response = await apiClient.patch(`/pm/category-attributes/${groupId}/reorder`, attributeIds);
    return response.data;
};

