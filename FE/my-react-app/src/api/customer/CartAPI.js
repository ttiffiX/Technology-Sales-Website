import apiClient from '../apiClient';
import {useEffect, useState} from "react";
import { getApiErrorMessage } from '../../utils';

// Add item to cart
export const addCartItem = async (productId) => {
    try {
        const response = await apiClient.post('/cart', {
            productId
        });
        return response.data;
    } catch (err) {
        throw getApiErrorMessage(err, 'Failed to add item to cart');
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
                if (getApiErrorMessage(err, '') === 'User not authenticated') {
                    setError('Please login to view your cart');
                } else {
                    setError(getApiErrorMessage(err, 'Failed to fetch cart products'));
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
    try {
        const response = await apiClient.get('/cart');
        return response.data;
    } catch (error) {
        throw getApiErrorMessage(error, 'Failed to fetch cart products');
    }
};

// Get total quantity only (lightweight API call)
export const getTotalQuantity = async () => {
    try {
        const response = await apiClient.get('/cart/total-quantity');
        return response.data;
    } catch (error) {
        throw getApiErrorMessage(error, 'Failed to get cart quantity');
    }
};

// Hook to get total quantity only (for Nav count)
export const useCartTotalQuantity = () => {
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const count = await getTotalQuantity();
                setTotalQuantity(count);
            } catch (err) {
                // Ignore error if user not logged in
                console.log('Cart count not loaded:', err);
                setTotalQuantity(0);
            } finally {
                setLoading(false);
            }
        };
        fetchCount();
    }, []);

    return { totalQuantity, loading };
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
        throw getApiErrorMessage(error, 'Failed to update cart item');
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
        throw getApiErrorMessage(error, 'Failed to remove cart item');
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
        throw getApiErrorMessage(error, 'Failed to toggle product selection');
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
        throw getApiErrorMessage(error, 'Failed to toggle all products');
    }
};

