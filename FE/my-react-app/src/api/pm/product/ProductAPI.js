import apiClient from '../../apiClient';
import { buildAddProductPayload, buildUpdateProductPayload } from '../../../utils';

export const addProduct = async (productRequest, attributeSchemas = []) => {
    const payload = buildAddProductPayload(productRequest, attributeSchemas);

    // If caller provided an imageFile (File object), send multipart/form-data
    if (productRequest && productRequest.imageFile) {
        const formData = new FormData();

        const blob = new Blob([JSON.stringify(payload)], {
            type: 'application/json'
        });

        formData.append('request', blob);
        formData.append('file', productRequest.imageFile);

        const response = await apiClient.post('/pm/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    // Fallback: send JSON body (no file)
    const response = await apiClient.post('/pm/products', payload);
    return response.data;
};

export const getPMProducts = async (params = {}) => {
    const response = await apiClient.get('/pm/products', { params });
    return response.data;
};

export const getPMProductDetail = async (productId) => {
    const response = await apiClient.get(`/pm/products/${productId}`);
    return response.data;
};

export const updatePMProduct = async (productId, productForm, attributeSchemas = [], detailAttributes = {}, editedAttributeValues = null) => {
    const payload = buildUpdateProductPayload(productForm, attributeSchemas, detailAttributes, editedAttributeValues);

    // If caller provided an imageFile (File object), send multipart/form-data
    if (productForm && productForm.imageFile && productForm.imageFile instanceof File) {
        const formData = new FormData();

        const blob = new Blob([JSON.stringify(payload)], {
            type: 'application/json'
        });

        formData.append('request', blob);
        formData.append('file', productForm.imageFile);

        const response = await apiClient.put(`/pm/products/${productId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    // Fallback: send JSON body (no file or imageFile is string URL)
    const response = await apiClient.put(`/pm/products/${productId}`, payload);
    return response.data;
};

export const updatePMProductState = async (productId, active) => {
    const response = await apiClient.patch(`/pm/products/${productId}/state`, null, {
        params: { active },
    });
    return response.data;
};

export const deletePMProduct = async (productId) => {
    const response = await apiClient.delete(`/pm/products/${productId}`);
    return response.data;
};

