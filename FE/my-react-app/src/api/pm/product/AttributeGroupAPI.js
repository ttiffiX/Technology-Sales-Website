import apiClient from '../../apiClient';

export const getAttributeGroupsByCategory = async (categoryId) => {
    if (!categoryId) {
        return [];
    }

    const response = await apiClient.get(`/pm/attribute-groups/category/${categoryId}`);
    return Array.isArray(response.data) ? response.data : [];
};

export const addAttributeGroup = async (request) => {
    const response = await apiClient.post('/pm/attribute-groups', request);
    return response.data;
};

export const updateAttributeGroup = async (groupId, request) => {
    const response = await apiClient.put(`/pm/attribute-groups/${groupId}`, request);
    return response.data;
};

export const deleteAttributeGroup = async (groupId) => {
    const response = await apiClient.delete(`/pm/attribute-groups/${groupId}`);
    return response.data;
};

export const updateAttributeGroupOrder = async (categoryId, groupIds) => {
    const response = await apiClient.patch(`/pm/attribute-groups/category/${categoryId}/reorder`, groupIds);
    return response.data;
};

