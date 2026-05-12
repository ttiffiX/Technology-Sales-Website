import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import '../../../App.scss';
import './Home.scss';
import 'react-toastify/dist/ReactToastify.css';
import ProductGrid from "../../../components/productgrid/ProductGrid";
import Nav from "../../../components/navigation/Nav";
import Header from "../../../components/header/Header";
import FilterSidebar from "../../../components/filtersidebar/FilterSidebar";
import useFetchProducts, {filterProducts, getAllCategories} from "../../../api/customer/ProductAPI";
import PaginationControls from '../../../components/pagination/PaginationControls';
import {useCart} from "../../../contexts/CartContext";
import CompareBar from "../../../components/comparebar/CompareBar";
import {formatPrice, getImage} from '../../../utils';

function Home() {
    const DEFAULT_SORT = 'hot';
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const {products: allProducts, loading: initialLoading, error: initialError} = useFetchProducts();
    const {cartCount} = useCart();

    // State for filtering
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentFilters, setCurrentFilters] = useState({});
    const [pageInfo, setPageInfo] = useState({ page: 0, size: 24, totalPages: 0, totalElements: 0 });
    const filterDebounceRef = useRef(null);
    const groupedCarouselRefs = useRef({});
    const productsContainerRef = useRef(null);
    // Đảm bảo sync từ URL chỉ chạy 1 lần duy nhất (kể cả khi back về từ trang khác)
    const hasInitialized = useRef(false);

    const scrollProductsIntoView = () => {
        if (productsContainerRef.current) {
            productsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };


    const applyPageResponse = (resp, fallbackPage = 0) => {
        const content = Array.isArray(resp?.content) ? resp.content : [];
        const nextPage = Number.isFinite(resp?.pageNumber) ? resp.pageNumber : fallbackPage;
        const nextSize = Number.isFinite(resp?.pageSize) ? resp.pageSize : pageInfo.size;
        const nextTotalPages = Number.isFinite(resp?.totalPages) ? resp.totalPages : 0;
        const nextTotalElements = Number.isFinite(resp?.totalElements) ? resp.totalElements : content.length;

        setProducts(content);
        setPageInfo({ page: nextPage, size: nextSize, totalPages: nextTotalPages, totalElements: nextTotalElements });
    };

    const buildSearchUrlParams = (nextFilters = {}, nextKeyword = searchKeyword, nextCategoryId = selectedCategoryId, nextPage = null) => {
        const params = {};
        const trimmedKeyword = String(nextKeyword || '').trim();
        const hasCategory = nextCategoryId !== null && nextCategoryId !== undefined && String(nextCategoryId).trim() !== '';
        const hasExplicitFilters = Object.entries(nextFilters || {}).some(([key, value]) => {
            if (key === 'sort') return Boolean(value);
            if (value === undefined || value === null) return false;
            if (Array.isArray(value)) return value.length > 0;
            return String(value).trim() !== '';
        });
        const shouldApplyDefaultSort = trimmedKeyword || hasCategory || hasExplicitFilters;

        if (trimmedKeyword) params.search = trimmedKeyword;
        if (hasCategory) params.category = String(nextCategoryId);
        if (nextFilters.minPrice) params.minPrice = String(nextFilters.minPrice);
        if (nextFilters.maxPrice) params.maxPrice = String(nextFilters.maxPrice);
        if (nextFilters.sort) {
            params.sort = nextFilters.sort;
        } else if (shouldApplyDefaultSort) {
            params.sort = DEFAULT_SORT;
        }
        if (nextFilters.attributes) {
            Object.entries(nextFilters.attributes).forEach(([attrCode, values]) => {
                if (values && values.length > 0) {
                    params[attrCode] = values.join(',');
                }
            });
        }
        if (Number.isFinite(nextPage) && nextPage > 0) params.page = String(nextPage);
        params.size = String(pageInfo.size);
        return params;
    };

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

    // Sync state from URL on initial load — chỉ chạy 1 lần duy nhất
    useEffect(() => {
        if (!allProducts || categories.length === 0) return;
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const urlCategoryId = searchParams.get('category');
        const urlSearch = searchParams.get('search');
        const urlPageRaw = Number.parseInt(searchParams.get('page') || '0', 10);
        const initialPage = Number.isFinite(urlPageRaw) && urlPageRaw >= 0 ? urlPageRaw : 0;

        const categoryId = urlCategoryId ? Number.parseInt(urlCategoryId, 10) : null;

        // Restore filter params from URL
        const filters = {};
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sort = searchParams.get('sort');

        if (minPrice) filters.minPrice = parseInt(minPrice);
        if (maxPrice) filters.maxPrice = parseInt(maxPrice);
        if (sort) filters.sort = sort;

        // Restore attribute filters — keys are attribute codes directly (no attr_ prefix)
        const systemKeys = new Set(['category', 'minPrice', 'maxPrice', 'sort', 'search', 'page', 'size']);
        const attributes = {};
        searchParams.forEach((value, key) => {
            if (!systemKeys.has(key)) {
                attributes[key] = value.split(',');
            }
        });
        if (Object.keys(attributes).length > 0) {
            filters.attributes = attributes;
        }

        const hasUrlFilterState = Boolean(
            urlSearch ||
            categoryId ||
            minPrice ||
            maxPrice ||
            sort ||
            Object.keys(attributes).length > 0
        );

        if (hasUrlFilterState) {
            const initialFilters = {
                ...filters,
                sort: filters.sort || DEFAULT_SORT,
            };

            setSearchKeyword(urlSearch || '');
            setCurrentFilters(initialFilters);
            handleCategoryChangeWithFilters(categoryId, initialFilters, initialPage, urlSearch || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allProducts, categories]);

    // Handle category change with optional filters
    const handleCategoryChangeWithFilters = async (categoryId, filters = {}, page = 0, keywordOverride = searchKeyword) => {
        const effectiveKeyword = String(keywordOverride || '').trim();
        const hasExplicitFilters = Object.entries(filters || {}).some(([key, value]) => {
            if (key === 'sort') return Boolean(value);
            if (value === undefined || value === null) return false;
            if (Array.isArray(value)) return value.length > 0;
            return String(value).trim() !== '';
        });

        setSelectedCategoryId(categoryId);
        setError(null);

        if (!categoryId && !effectiveKeyword && !hasExplicitFilters) {
            // Show all products only when nothing else is active
            setProducts(allProducts);
            setSelectedCategoryName('');
            setCurrentFilters({});
            setSearchKeyword('');
            setSearchParams({});
            setPageInfo({ page: 0, size: 24, totalPages: 0, totalElements: 0 });
            return;
        }

        const effectiveFilters = {
            ...filters,
            sort: filters.sort || DEFAULT_SORT,
        };

        setCurrentFilters(effectiveFilters);
        setSearchKeyword(effectiveKeyword);

        // Update URL params
        const params = buildSearchUrlParams(effectiveFilters, effectiveKeyword, categoryId, page);
        setSearchParams(params);

        if (!categoryId) {
            setSelectedCategoryName('');
        }

        setLoading(true);
        scrollProductsIntoView();
        try {
            const resp = await filterProducts({
                keyword: effectiveKeyword || undefined,
                categoryId: categoryId || undefined,
                ...effectiveFilters,
                page,
                size: pageInfo.size,
            });
            applyPageResponse(resp, page);

            // Get category name from categories array
            const category = categoryId ? categories.find(cat => cat.id === categoryId) : null;
            setSelectedCategoryName(category ? category.name : '');
        } catch (err) {
            setError(err.response?.data || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Handle category change
    const handleCategoryChange = async (categoryId) => {
        // When user selects "All Products" (categoryId = null)
        if (categoryId === null) {
            // Check if search is empty/null/whitespace
            const hasActiveSearch = searchKeyword && searchKeyword.trim() !== '';

            if (!hasActiveSearch) {
                // No search → reset to homepage view
                setSelectedCategoryId(null);
                setSelectedCategoryName('');
                setCurrentFilters({});
                setSearchKeyword('');
                setProducts(allProducts);
                setSearchParams({});
                setPageInfo({ page: 0, size: 24, totalPages: 0, totalElements: 0 });
                return;
            }
        }
        await handleCategoryChangeWithFilters(categoryId, currentFilters, 0, searchKeyword);
    };

    // Handle filter change from sidebar (debounced 400ms)
    const handleFilterChange = (filters) => {
        // Update URL and current filters
        const effectiveFilters = {
            ...filters,
            sort: filters.sort || DEFAULT_SORT,
        };
        setCurrentFilters(effectiveFilters);
        setSearchParams(buildSearchUrlParams(effectiveFilters, searchKeyword, selectedCategoryId, 0));

        // Debounce: huỷ timer cũ, đặt timer mới 400ms
        if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
        filterDebounceRef.current = setTimeout(async () => {
            setLoading(true);
            scrollProductsIntoView();
            setError(null);
            try {
                const resp = await filterProducts({ categoryId: selectedCategoryId || undefined, keyword: searchKeyword || undefined, ...effectiveFilters, page: 0, size: pageInfo.size });
                applyPageResponse(resp, 0);
            } catch (err) {
                setError(err.response?.data || 'Failed to filter products');
            } finally {
                setLoading(false);
            }
        }, 400);
    };

    // Handle search
    const handleSearch = async (keyword) => {
        await handleCategoryChangeWithFilters(selectedCategoryId, currentFilters, 0, keyword);
    };

    const isGroupedHomeView =
        !selectedCategoryId &&
        Array.isArray(products) &&
        products.length > 0 &&
        Array.isArray(products[0]?.productList);

    // Show sidebar when user performed any action (category select, search, or any applied filters)
    const showSidebar = Boolean(selectedCategoryId) || (searchKeyword && searchKeyword.trim() !== '') || (currentFilters && Object.keys(currentFilters).length > 0);

    const handleExploreCategory = async (categoryId) => {
        if (!categoryId) return;
        await handleCategoryChangeWithFilters(Number(categoryId), {});
    };

    const handleCarouselScroll = (carouselKey, direction) => {
        const container = groupedCarouselRefs.current[carouselKey];
        if (!container) return;
        const step = Math.max(280, Math.floor(container.clientWidth * 0.85));
        container.scrollBy({left: step * direction, behavior: 'smooth'});
    };

    const handleGroupedProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    if (initialLoading) return <div className="loading-container"><p>Loading products...</p></div>;
    if (initialError) return <div className="error-container"><p>{initialError}</p></div>;

    return (
        <div className={"MyApp"}>
            <Nav count={cartCount}/>

            <Header
                title="Product"
                onSearch={handleSearch}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                categories={categories}
                modeDisplay={"product"}
            />

            <div className="home-content">
                {/* Sidebar Filter - show when user performed any action (category select or search/filters) */}
                {showSidebar && (
                    <div className="sidebar-container">
                        <FilterSidebar
                            categoryId={selectedCategoryId}
                            categoryName={selectedCategoryName}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                )}

                {/* Product Grid / grouped categories on home */}
                <div ref={productsContainerRef} className={`products-container ${showSidebar ? 'with-sidebar' : 'full-width'}`}>
                    {loading && <div className="loading-overlay">Loading...</div>}
                    {error && <div className="error-message">{error}</div>}

                    {isGroupedHomeView ? (
                        <div className="category-showcase-list">
                            {products.map((category, index) => {
                                const carouselKey = category.categoryId ?? index;
                                const categoryProducts = Array.isArray(category.productList) ? category.productList : [];

                                return (
                                    <section className="category-showcase" key={carouselKey}>
                                        <div className="category-showcase__header">
                                            <h3 className="category-showcase__title">{category.categoryName}</h3>
                                            <button
                                                className="category-showcase__explore"
                                                onClick={() => handleExploreCategory(category.categoryId)}
                                            >
                                                Explore
                                            </button>
                                        </div>

                                        <div className="category-showcase__viewport">
                                            <button
                                                className="carousel-arrow carousel-arrow--left"
                                                aria-label={`Xem san pham truoc cua ${category.categoryName}`}
                                                onClick={() => handleCarouselScroll(carouselKey, -1)}
                                            >
                                                &#8249;
                                            </button>

                                            <div
                                                className="category-showcase__track"
                                                ref={(el) => {
                                                    groupedCarouselRefs.current[carouselKey] = el;
                                                }}
                                            >
                                                {categoryProducts.map((product) => (
                                                    <article
                                                        className="category-showcase__item"
                                                        key={product.id}
                                                        onClick={() => handleGroupedProductClick(product.id)}
                                                    >
                                                        <div
                                                            className="category-showcase__image"
                                                            style={{backgroundImage: `url(${getImage(product.imageUrl)})`}}
                                                        />
                                                        <h4 className="category-showcase__name">{product.title}</h4>
                                                        <p className="category-showcase__price">{formatPrice(product.price)}</p>
                                                    </article>
                                                ))}
                                            </div>

                                            <button
                                                className="carousel-arrow carousel-arrow--right"
                                                aria-label={`Xem san pham tiep theo cua ${category.categoryName}`}
                                                onClick={() => handleCarouselScroll(carouselKey, 1)}
                                            >
                                                &#8250;
                                            </button>
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        <>
                                            {showSidebar && (
                                                <div className="products-summary">
                                                    <span>
                                                        Found <span className="products-summary__count">{pageInfo.totalElements}</span> product{pageInfo.totalElements === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                            )}
                            <div className="products-grid-anchor">
                                <ProductGrid products={products} categoryId={selectedCategoryId}/>
                            </div>
                            <PaginationControls
                                page={pageInfo.page}
                                totalPages={pageInfo.totalPages}
                                totalElements={pageInfo.totalElements}
                                onPageChange={async (newPage) => {
                                    setLoading(true);
                                    scrollProductsIntoView();
                                    try {
                                        const resp = await filterProducts({ categoryId: selectedCategoryId, keyword: searchKeyword, ...currentFilters, sort: currentFilters.sort || DEFAULT_SORT, page: newPage, size: pageInfo.size });
                                        applyPageResponse(resp, newPage);
                                        setSearchParams(buildSearchUrlParams(currentFilters, searchKeyword, selectedCategoryId, newPage));
                                    } catch (err) {
                                        setError(err.response?.data || 'Failed to load page');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Compare Bar */}
            <CompareBar/>
        </div>
    );
}

export default Home
