import apiClient from './apiClient';
import { buildAddProductPayload } from '../utils';

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

