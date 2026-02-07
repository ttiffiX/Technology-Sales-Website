import React, { createContext, useState, useContext, useCallback } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
    const [compareProducts, setCompareProducts] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Add product to compare list
    const addToCompare = useCallback((product, categoryIdParam) => {
        setCompareProducts(prev => {
            // If category changes, clear the list
            if (categoryId && categoryId !== categoryIdParam) {
                setCategoryId(categoryIdParam);
                return [product];
            }

            // Set category if not set
            if (!categoryId) {
                setCategoryId(categoryIdParam);
            }

            // Check if product already exists
            if (prev.find(p => p.id === product.id)) {
                return prev;
            }

            // Max 3 products
            if (prev.length >= 3) {
                return prev;
            }

            return [...prev, product];
        });
    }, [categoryId]);

    // Remove product from compare list
    const removeFromCompare = useCallback((productId) => {
        setCompareProducts(prev => {
            const newList = prev.filter(p => p.id !== productId);
            // Clear category if list is empty
            if (newList.length === 0) {
                setCategoryId(null);
            }
            return newList;
        });
    }, []);

    // Clear all products
    const clearCompare = useCallback(() => {
        setCompareProducts([]);
        setCategoryId(null);
    }, []);

    // Toggle minimize
    const toggleMinimize = useCallback(() => {
        setIsMinimized(prev => !prev);
    }, []);

    const value = {
        compareProducts,
        categoryId,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isMinimized,
        toggleMinimize,
        compareCount: compareProducts.length
    };

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within CompareProvider');
    }
    return context;
};

