import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTotalQuantity } from '../api/CartAPI';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch cart count on mount
    const fetchCartCount = useCallback(async () => {
        try {
            const count = await getTotalQuantity();
            setCartCount(count);
        } catch (err) {
            console.log('Cart count not loaded:', err);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    // Refresh cart count (call this after adding/removing items)
    const refreshCartCount = useCallback(async () => {
        try {
            const count = await getTotalQuantity();
            setCartCount(count);
        } catch (err) {
            console.log('Failed to refresh cart count:', err);
        }
    }, []);

    // Update cart count locally (optimistic update)
    const updateCartCount = useCallback((newCount) => {
        setCartCount(newCount);
    }, []);

    // Increment cart count
    const incrementCartCount = useCallback(() => {
        setCartCount(prev => prev + 1);
    }, []);

    // Decrement cart count
    const decrementCartCount = useCallback(() => {
        setCartCount(prev => Math.max(0, prev - 1));
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartCount,
                loading,
                refreshCartCount,
                updateCartCount,
                incrementCartCount,
                decrementCartCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

