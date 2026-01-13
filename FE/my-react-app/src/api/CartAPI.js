import apiClient from './apiClient';
import {useEffect, useState} from "react";

// Add item to cart
export const addCartItem = async (productId) => {
    try {
        const response = await apiClient.post('/cart', {
            productId
        });
        return response.data;
    } catch (err) {
        throw err.response?.data.message || err.message;
    }
};

// Hook to get cart items (for Cart page initial load)
export const useGetCartItems = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalQuantity, setTotalQuantity] = useState(0);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const {totalQuantity, cartDetailDTO} = await fetchCartItems();
                setCartItems(cartDetailDTO);
                setTotalQuantity(totalQuantity);
            } catch (err) {
                // console.error('Failed to fetch cart:', err);
                // Set user-friendly error message
                if (err === 'User not authenticated') {
                    setError('Please login to view your cart');
                } else {
                    setError('Failed to fetch cart products');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    return {cartItems, totalQuantity, loading, error};
};

// Fetch cart items (direct API call)
export const fetchCartItems = async () => {
    const response = await apiClient.get('/cart');
    return response.data;
};

// Get total quantity only (lightweight API call)
export const getTotalQuantity = async () => {
    try {
        const response = await apiClient.get('/cart/total-quantity');
        return response.data;
    } catch (error) {
        throw error.response?.data.message || error.message;
    }
};

// Update cart item quantity (delta change)
export const updateCartQuantity = async (productId, delta) => {
    try {
        const response = await apiClient.patch('/cart', {
            productId,
            quantity: delta
        });
        return response.data;
    } catch (error) {
        throw error.response?.data.message || error.message;
    }
};

// Remove item from cart
export const removeCartItem = async (productId) => {
    try {
        const response = await apiClient.delete('/cart', {
            data: { productId },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data.message || error.message;
    }
};

// Toggle selection for a single product
export const toggleProductSelection = async (productId) => {
    try {
        const response = await apiClient.patch('/cart/toggle-selection', {
            productId
        });
        return response.data;
    } catch (error) {
        throw error.response?.data.message || error.message;
    }
};

// Toggle selection for all products
export const toggleAllProducts = async (selectAll) => {
    try {
        const response = await apiClient.patch('/cart/toggle-all', {
            selectAll
        });
        return response.data;
    } catch (error) {
        throw error.response?.data.message || error.message;
    }
};

