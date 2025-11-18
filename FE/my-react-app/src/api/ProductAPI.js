import { useEffect, useState } from 'react';
import apiClient from './apiClient';

/**
 * Hook to fetch all products
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

    return { products, loading, error };
}

/**
 * Get all categories
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
 * Get filter options for a category
 */
export const getFilterOptions = async (categoryId) => {
    try {
        const response = await apiClient.get(`/product/category/${categoryId}/filter-options`);
        return response.data;
    } catch (error) {
        // console.error('Failed to get filter options:', error);
        throw error;
    }
};

/**
 * Filter products by category with optional filters
 * @param categoryId - Category ID
 * @param filters - { minPrice, maxPrice, sort, attributes: { attributeId: [values] } }
 */
export const filterProducts = async (categoryId, filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.sort) params.append('sort', filters.sort);

        // Add attribute filters
        if (filters.attributes) {
            for (const [attrId, values] of Object.entries(filters.attributes)) {
                if (values && values.length > 0) {
                    params.append(`attr_${attrId}`, values.join(','));
                }
            }
        }

        const url = `/product/category/${categoryId}/filter?${params.toString()}`;
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        // console.error('Failed to filter products:', error);
        throw error;
    }
};

/**
 * Search products by keyword
 */
export const searchProducts = async (keyword) => {
    try {
        const response = await apiClient.get(`/product/search?keyword=${encodeURIComponent(keyword)}`);
        return response.data;
    } catch (error) {
        // console.error('Failed to search products:', error);
        throw error;
    }
};

/**
 * Get product detail by ID
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

export default useFetchProducts;
