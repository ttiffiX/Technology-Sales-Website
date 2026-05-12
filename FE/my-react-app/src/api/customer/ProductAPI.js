import {useEffect, useState} from 'react';
import apiClient from '../apiClient';
import {normalizePageResponse} from '../../utils';

/**
 * Hook to fetch initial top products for the homepage.
 */
function useFetchProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiClient.get('/product');
                setProducts(response.data);
            } catch (err) {
                setError('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return {products, loading, error};
}

/**
 * Get all categories.
 */
export const getAllCategories = async () => {
    try {
        const response = await apiClient.get('/product/categories');
        return response.data;
    } catch (error) {
        // console.error('Failed to get categories:', error);
        throw error;
    }
};

/**
 * Get filter options for a category.
 * @param {number} categoryId - The ID of the category.
 */
export const getFilterOptions = async (categoryId) => {
    try {
        const params = {};
        if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
            params.categoryId = categoryId;
        }
        const response = await apiClient.get(`/product/filter-options`, { params });
        return response.data;
    } catch (error) {
        // console.error('Failed to get filter options:', error);
        throw error;
    }
};

/**
 * Unified product filtering and searching.
 * Returns a Page object from the backend.
 * @param {object} filters - The filter criteria.
 * @param {string} [filters.keyword] - Search keyword.
 * @param {number} [filters.categoryId] - Category ID.
 * @param {number} [filters.minPrice] - Minimum price.
 * @param {number} [filters.maxPrice] - Maximum price.
 * @param {string} [filters.sort] - Sort order (e.g., 'price_asc').
 * @param {number} [filters.page] - Page number for pagination (0-indexed).
 * @param {number} [filters.size] - Page size for pagination.
 * @param {object} [filters.attributes] - Attribute filters (e.g., { ram: ['8gb', '16gb'] }).
 */
export const filterProducts = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        // Standard filters
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);
        
        // Pagination (support page=0)
        if (filters.page !== undefined && filters.page !== null) params.append('page', filters.page);
        if (filters.size !== undefined && filters.size !== null) params.append('size', filters.size);

        // Dynamic attribute filters
        if (filters.attributes) {
            for (const [attrCode, values] of Object.entries(filters.attributes)) {
                if (values && values.length > 0) {
                    params.append(attrCode, values.join(','));
                }
            }
        }

        const response = await apiClient.get('/product/filter', { params });
        return normalizePageResponse(response.data);
    } catch (error) {
        // console.error('Failed to search products:', error);
        throw error;
    }
};

/**
 * Get product detail by ID.
 */
export const getProductDetail = async (productId) => {
    try {
        const response = await apiClient.get(`/product/${productId}`);
        return response.data;
    } catch (error) {
        // console.error('Failed to get product detail:', error);
        throw error;
    }
};

/**
 * Compare products.
 */
export const compareProducts = async (categoryId, productIds) => {
    try {
        const response = await apiClient.post('/product/compare', {
            categoryId,
            productIds
        });
        return response.data;
    } catch (error) {
        // console.error('Failed to compare products:', error);
        throw error;
    }
};

export default useFetchProducts;
