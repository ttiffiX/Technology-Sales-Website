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

