export const filterProductsByCategory = (products, category) => {
    if (!category) return products;
    return products.filter(product => product.category === category);
};

export const sortProducts = (products, order) => {
    const sortedProducts = [...products]; // Sử dụng sao chép để không làm thay đổi mảng gốc
    if (order === 'asc') {
        sortedProducts.sort((a, b) => a.price - b.price);
    } else if (order === 'desc') {
        sortedProducts.sort((a, b) => b.price - a.price);
    }
    return sortedProducts;
};

export const filterProducts = (products, searchText, inStockOnly, category) => {
    return products.filter(product => {
        const matchesText = product.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesStock = inStockOnly ? product.stocked : true;
        const matchesCategory = category ? product.category === category : true;
        return matchesText && matchesStock && matchesCategory;
    });
};

// Hàm cập nhật bộ lọc sản phẩm
export const updateFilteredProducts = (products, searchText, inStockOnly, category, order) => {
    let filtered = filterProducts(products, searchText, inStockOnly, category);
    if (order) {
        filtered = sortProducts(filtered, order);
    }
    return filtered;
};
