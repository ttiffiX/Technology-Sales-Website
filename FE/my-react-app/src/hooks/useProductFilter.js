import { useState, useEffect } from "react";
import { updateFilteredProducts } from "../utils/FilterProduct";

function useProductFilter(products) {
    const [searchText, setSearchText] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products);

    // Cập nhật filteredProducts khi products thay đổi
    useEffect(() => {
        setFilteredProducts(updateFilteredProducts(products, searchText, inStockOnly, selectedCategory, activeOrder));
    }, [products, searchText, inStockOnly, selectedCategory, activeOrder]);

    const handleFilterChange = (searchText, inStockOnly) => {
        setSearchText(searchText);
        setInStockOnly(inStockOnly);
    };

    const handleSort = (order) => {
        setActiveOrder(order);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    return {
        activeOrder,
        selectedCategory,
        filteredProducts,
        handleFilterChange,
        handleSort,
        handleCategoryChange,
    };
}

export default useProductFilter;
