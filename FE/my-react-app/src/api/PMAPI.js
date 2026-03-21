import apiClient from './apiClient';
import { buildAddProductPayload, buildUpdateProductPayload } from '../utils';

/**
 * Lấy danh sách attributes theo categoryId
 * GET /pm/category/{categoryId}/attributes
 */
export const getAttributesByCategory = async (categoryId) => {
    if (!categoryId) {
        return [];
    }

    const response = await apiClient.get(`/pm/category/${categoryId}/attributes`);
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Thêm sản phẩm mới
 * POST /pm/products
 * @param {Object} productRequest - { categoryId, title, description, price, imageUrl, isActive, attributes }
 * @param {Array} attributeSchemas - danh sách schema trả về từ getAttributesByCategory
 */
export const addProduct = async (productRequest, attributeSchemas = []) => {
    const payload = buildAddProductPayload(productRequest, attributeSchemas);
    const response = await apiClient.post('/pm/products', payload);
    return response.data;
};

export const getPMProducts = async () => {
    const response = await apiClient.get('/pm/products');
    return Array.isArray(response.data) ? response.data : [];
};

export const getPMProductDetail = async (productId) => {
    const response = await apiClient.get(`/pm/products/${productId}`);
    return response.data;
};

export const updatePMProduct = async (productId, productForm, attributeSchemas = [], detailAttributes = {}, editedAttributeValues = null) => {
    const payload = buildUpdateProductPayload(productForm, attributeSchemas, detailAttributes, editedAttributeValues);
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

export const addCategory = async (name) => {
    const response = await apiClient.post('/pm/category/add', null, {
        params: { name },
    });
    return response.data;
};

export const updateCategory = async (categoryId, name) => {
    const response = await apiClient.put(`/pm/category/${categoryId}/update`, null, {
        params: { name },
    });
    return response.data;
};

export const deleteCategory = async (categoryId) => {
    try {
        const response = await apiClient.delete(`/pm/category/${categoryId}/delete`);
        return response.data;
    } catch (error) {
        if (error?.response?.status !== 404) {
            throw error;
        }

        // Backward-compatible fallback when BE mapping is declared without leading slash.
        const response = await apiClient.delete(`/pmcategory/${categoryId}/delete`);
        return response.data;
    }
};

