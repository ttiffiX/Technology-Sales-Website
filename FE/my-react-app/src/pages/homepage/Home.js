import React, {useEffect, useState} from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../App.scss';
import './Home.scss';
import 'react-toastify/dist/ReactToastify.css';
import ProductGrid from "../../components/productgrid/ProductGrid";
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import FilterSidebar from "../../components/filtersidebar/FilterSidebar";
import useFetchProducts, { filterProducts, searchProducts, getAllCategories } from "../../api/ProductAPI";
import {getTotalQuantity} from "../../api/CartAPI";

function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const {products: allProducts, loading: initialLoading, error: initialError} = useFetchProducts();
    const [count, setCount] = useState(0);
    const {totalQuantity} = getTotalQuantity();

    // State for filtering
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentFilters, setCurrentFilters] = useState({});

    useEffect(() => {
        setCount(totalQuantity);
    }, [totalQuantity]);

    // Load all products initially
    useEffect(() => {
        if (!initialLoading && allProducts) {
            setProducts(allProducts);
        }
    }, [allProducts, initialLoading]);

    // Load categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await getAllCategories();
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Sync state from URL on initial load
    useEffect(() => {
        if (!allProducts || categories.length === 0) return;

        const urlCategoryId = searchParams.get('category');
        const urlSearch = searchParams.get('search');

        if (urlSearch) {
            // If search param exists, perform search
            setSearchKeyword(urlSearch);
            handleSearch(urlSearch);
        } else if (urlCategoryId) {
            // If category param exists, filter by category
            const categoryId = parseInt(urlCategoryId);

            // Restore filter params from URL
            const filters = {};
            const minPrice = searchParams.get('minPrice');
            const maxPrice = searchParams.get('maxPrice');
            const sort = searchParams.get('sort');

            if (minPrice) filters.minPrice = parseInt(minPrice);
            if (maxPrice) filters.maxPrice = parseInt(maxPrice);
            if (sort) filters.sort = sort;

            // Restore attribute filters (attr_1, attr_2, etc.)
            const attributes = {};
            searchParams.forEach((value, key) => {
                if (key.startsWith('attr_')) {
                    const attrId = key.substring(5);
                    attributes[attrId] = value.split(',');
                }
            });
            if (Object.keys(attributes).length > 0) {
                filters.attributes = attributes;
            }

            setCurrentFilters(filters);
            handleCategoryChangeWithFilters(categoryId, filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allProducts, categories]);

    // Handle category change with optional filters
    const handleCategoryChangeWithFilters = async (categoryId, filters = {}) => {
        setSelectedCategoryId(categoryId);
        setError(null);
        setSearchKeyword(''); // Clear search when changing category

        // Update URL params
        if (categoryId) {
            const params = { category: categoryId.toString() };

            // Add filter params to URL
            if (filters.minPrice) params.minPrice = filters.minPrice.toString();
            if (filters.maxPrice) params.maxPrice = filters.maxPrice.toString();
            if (filters.sort) params.sort = filters.sort;

            // Add attribute filters
            if (filters.attributes) {
                Object.entries(filters.attributes).forEach(([attrId, values]) => {
                    params[`attr_${attrId}`] = values.join(',');
                });
            }

            setSearchParams(params);
        } else {
            setSearchParams({}); // Clear all params
        }

        if (!categoryId) {
            // Show all products
            setProducts(allProducts);
            setSelectedCategoryName('');
            setCurrentFilters({});
            return;
        }

        setLoading(true);
        try {
            const filtered = await filterProducts(categoryId, filters);
            setProducts(filtered);

            // Get category name from categories array
            const category = categories.find(cat => cat.id === categoryId);
            setSelectedCategoryName(category ? category.name : '');
        } catch (err) {
            setError(err.response?.data || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Handle category change
    const handleCategoryChange = async (categoryId) => {
        await handleCategoryChangeWithFilters(categoryId, {});
    };

    // Handle filter change from sidebar
    const handleFilterChange = async (filters) => {
        if (!selectedCategoryId) return;

        // Store current filters
        setCurrentFilters(filters);

        // Update URL with filters
        const params = { category: selectedCategoryId.toString() };

        if (filters.minPrice) params.minPrice = filters.minPrice.toString();
        if (filters.maxPrice) params.maxPrice = filters.maxPrice.toString();
        if (filters.sort) params.sort = filters.sort;

        // Add attribute filters
        if (filters.attributes) {
            Object.entries(filters.attributes).forEach(([attrId, values]) => {
                if (values && values.length > 0) {
                    params[`attr_${attrId}`] = values.join(',');
                }
            });
        }

        setSearchParams(params);

        setLoading(true);
        setError(null);
        try {
            const filtered = await filterProducts(selectedCategoryId, filters);
            setProducts(filtered);
        } catch (err) {
            setError(err.response?.data || 'Failed to filter products');
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const handleSearch = async (keyword) => {
        setSearchKeyword(keyword);

        if (!keyword || keyword.trim() === '') {
            // Clear search param and reset to current view
            const currentParams = Object.fromEntries(searchParams);
            delete currentParams.search;
            setSearchParams(currentParams);

            if (selectedCategoryId) {
                handleCategoryChange(selectedCategoryId);
            } else {
                setProducts(allProducts);
            }
            return;
        }

        // Update URL with search param
        setSearchParams({ search: keyword });

        setLoading(true);
        setError(null);
        try {
            const results = await searchProducts(keyword);
            setProducts(results);
            setSelectedCategoryId(null); // Clear category when searching
            setSelectedCategoryName('');
        } catch (err) {
            setError(err.response?.data || 'Failed to search products');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="loading-container"><p>Loading products...</p></div>;
    if (initialError) return <div className="error-container"><p>{initialError}</p></div>;

    return (
        <div className={"MyApp"}>
            <Nav count={count}/>

            <Header
                title="Product"
                onSearch={handleSearch}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                categories={categories}
                modeDisplay={"product"}
            />

            <div className="home-content">
                {/* Sidebar Filter - Only show when category is selected */}
                {selectedCategoryId && (
                    <div className="sidebar-container">
                        <FilterSidebar
                            categoryId={selectedCategoryId}
                            categoryName={selectedCategoryName}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                )}

                {/* Product Grid */}
                <div className={`products-container ${selectedCategoryId ? 'with-sidebar' : 'full-width'}`}>
                    {loading && <div className="loading-overlay">Loading...</div>}
                    {error && <div className="error-message">{error}</div>}
                    <ProductGrid products={products}/>
                </div>
            </div>
        </div>
    );
}

export default Home
