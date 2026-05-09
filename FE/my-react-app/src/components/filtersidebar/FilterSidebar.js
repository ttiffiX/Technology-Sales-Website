import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFilterOptions } from '../../api/customer/ProductAPI';
import {
    FILTER_MAX_PRICE_VALUE,
    buildDisplayOptions,
    formatPrice,
    normalizeFilterOptionsResponse,
    sortFilterValues,
} from '../../utils';
import './FilterSidebar.scss';

function FilterSidebar({ categoryId, onFilterChange }) {
    const [searchParams] = useSearchParams();
    const [filterOptions, setFilterOptions] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [priceRange, setPriceRange] = useState({ min: 0, max: FILTER_MAX_PRICE_VALUE });
    const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: FILTER_MAX_PRICE_VALUE });
    const [sort, setSort] = useState('price_asc');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState({});

    const isSectionOpen = (key) => collapsedSections[key] !== true;

    const toggleSection = (key) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [key]: prev[key] !== true,
        }));
    };

    // Load filter options + restore UI từ URL khi category thay đổi
    useEffect(() => {
        if (!categoryId) {
            setFilterOptions(null);
            return;
        }

        const loadFilterOptions = async () => {
            setLoading(true);
            try {
                const options = await getFilterOptions(categoryId);
                setFilterOptions(normalizeFilterOptionsResponse(options));

                // Chỉ restore từ URL nếu URL đang ứng với đúng category này
                // Ngược lại (switch category) → reset sạch
                const urlCategoryId = searchParams.get('category');
                const isSameCategory = urlCategoryId && parseInt(urlCategoryId) === categoryId;

                if (isSameCategory) {
                    const minPrice = searchParams.get('minPrice');
                    const maxPrice = searchParams.get('maxPrice');
                    const urlSort = searchParams.get('sort');

                    const defaultMin = minPrice ? parseInt(minPrice) : 0;
                    const defaultMax = maxPrice ? parseInt(maxPrice) : FILTER_MAX_PRICE_VALUE;
                    setPriceRange({ min: defaultMin, max: defaultMax });
                    setTempPriceRange({ min: defaultMin, max: defaultMax });
                    if (urlSort) setSort(urlSort);
                    else setSort('price_asc');

                    const systemKeys = new Set(['category', 'minPrice', 'maxPrice', 'sort', 'search', 'page', 'size']);
                    const attributes = {};
                    searchParams.forEach((value, key) => {
                        if (!systemKeys.has(key)) {
                            attributes[key] = sortFilterValues(value.split(','));
                        }
                    });
                    setSelectedFilters(attributes);
                } else {
                    // Switch sang category khác → reset sạch
                    setSelectedFilters({});
                    setPriceRange({ min: 0, max: FILTER_MAX_PRICE_VALUE });
                    setTempPriceRange({ min: 0, max: FILTER_MAX_PRICE_VALUE });
                    setSort('price_asc');
                }

            } catch (error) {
                console.error('Failed to load filter options:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFilterOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId]);

    // Gọi onFilterChange ngay khi user thay đổi bất kỳ filter nào
    const applyFilters = (overrides = {}) => {
        const filters = {
            minPrice: priceRange.min > 0 ? priceRange.min : undefined,
            maxPrice: priceRange.max < FILTER_MAX_PRICE_VALUE ? priceRange.max : undefined,
            sort,
            attributes: selectedFilters,
            ...overrides
        };
        onFilterChange(filters);
    };

    const handleAttributeChange = (attributeId, values, checked) => {
        const normalizedValues = sortFilterValues(Array.isArray(values) ? values : [values]);
        const current = selectedFilters[attributeId] || [];
        let updated;

        const currentSet = new Set(current);
        if (checked) {
            normalizedValues.forEach((value) => currentSet.add(value));
            updated = { ...selectedFilters, [attributeId]: sortFilterValues(Array.from(currentSet)) };
        } else {
            normalizedValues.forEach((value) => currentSet.delete(value));
            const filtered = sortFilterValues(Array.from(currentSet));
            if (filtered.length === 0) {
                const { [attributeId]: _, ...rest } = selectedFilters;
                updated = rest;
            } else {
                updated = { ...selectedFilters, [attributeId]: filtered };
            }
        }
        setSelectedFilters(updated);
        applyFilters({ attributes: updated });
    };

    const handleSortChange = (newSort) => {
        setSort(newSort);
        applyFilters({ sort: newSort });
    };

    const handlePriceSliderChange = (type, value) => {
        setTempPriceRange(prev => ({ ...prev, [type]: parseInt(value) }));
    };

    const handlePriceSliderRelease = () => {
        setPriceRange(tempPriceRange);
        applyFilters({ minPrice: tempPriceRange.min > 0 ? tempPriceRange.min : undefined,
                       maxPrice: tempPriceRange.max < FILTER_MAX_PRICE_VALUE ? tempPriceRange.max : undefined });
    };

    const resetFilters = () => {
        setSelectedFilters({});
        setPriceRange({ min: 0, max: FILTER_MAX_PRICE_VALUE });
        setTempPriceRange({ min: 0, max: FILTER_MAX_PRICE_VALUE });
        setSort('price_asc');
        onFilterChange({ sort: 'price_asc' });
    };

    if (!categoryId) return null;

    if (loading) {
        return (
            <div className="filter-sidebar">
                <div className="filter-loading">Loading filters...</div>
            </div>
        );
    }

    return (
        <>
            <button className="filter-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                Filters
            </button>

            <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
                <button className="filter-close-btn" onClick={() => setIsOpen(false)}>✕</button>

                <div className="filter-header">
                    <h3>Filters</h3>
                    <button onClick={resetFilters} className="reset-btn">Clear filters</button>
                </div>

                {/* Sort */}
                <div className="filter-section">
                    <div className="filter-section-header">
                        <h4>Sort by price</h4>
                        <button
                            type="button"
                            className="filter-section-toggle filter-section-toggle--section"
                            onClick={() => toggleSection('sort')}
                            title="Thu gon/mo rong: Sap xep theo gia"
                            aria-label="Thu gon/mo rong sap xep theo gia"
                        >
                            <span className={`filter-section-toggle-icon ${isSectionOpen('sort') ? 'open' : ''}`}>
                                {isSectionOpen('sort') ? '▴' : '▾'}
                            </span>
                        </button>
                    </div>
                    <div className={`filter-section-body ${isSectionOpen('sort') ? 'open' : 'collapsed'}`}>
                        <select value={sort} onChange={(e) => handleSortChange(e.target.value)} className="sort-select">
                            <option value="price_asc">Price: low → high</option>
                            <option value="price_desc">Price: high → low</option>
                        </select>
                    </div>
                </div>

                {/* Price range */}
                <div className="filter-section">
                    <div className="filter-section-header">
                        <h4>Price range</h4>
                        <button
                            type="button"
                            className="filter-section-toggle filter-section-toggle--section"
                            onClick={() => toggleSection('price')}
                            title="Thu gon/mo rong: Khoang gia"
                            aria-label="Thu gon/mo rong khoang gia"
                        >
                            <span className={`filter-section-toggle-icon ${isSectionOpen('price') ? 'open' : ''}`}>
                                {isSectionOpen('price') ? '▴' : '▾'}
                            </span>
                        </button>
                    </div>
                    <div className={`filter-section-body ${isSectionOpen('price') ? 'open' : 'collapsed'}`}>
                        <div className="price-display">
                            <span>{formatPrice(tempPriceRange.min)}</span>
                            <span>-</span>
                            <span>{formatPrice(tempPriceRange.max)}</span>
                        </div>
                        <div className="price-sliders">
                            <div className="slider-container">
                                <label>From:</label>
                                <input type="range" min="0" max="100000000" step="1000000"
                                    value={tempPriceRange.min}
                                    onChange={(e) => handlePriceSliderChange('min', e.target.value)}
                                    onMouseUp={handlePriceSliderRelease}
                                    onTouchEnd={handlePriceSliderRelease}
                                    className="price-slider"
                                />
                            </div>
                            <div className="slider-container">
                                <label>To:</label>
                                <input type="range" min="0" max="100000000" step="1000000"
                                    value={tempPriceRange.max}
                                    onChange={(e) => handlePriceSliderChange('max', e.target.value)}
                                    onMouseUp={handlePriceSliderRelease}
                                    onTouchEnd={handlePriceSliderRelease}
                                    className="price-slider"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attribute filters */}
                {filterOptions && Object.entries(filterOptions).map(([groupOrder, group]) => (
                    <div key={groupOrder} className="filter-section">
                        <div className="filter-section-header">
                            <h4 className="filter-group-name">{group.groupName}</h4>
                            <button
                                type="button"
                                className="filter-section-toggle filter-section-toggle--group"
                                onClick={() => toggleSection(`group-${groupOrder}`)}
                                title={`Thu gon/mo rong nhom: ${group.groupName}`}
                                aria-label={`Thu gon/mo rong nhom ${group.groupName}`}
                            >
                                <span className={`filter-section-toggle-icon ${isSectionOpen(`group-${groupOrder}`) ? 'open' : ''}`}>
                                    {isSectionOpen(`group-${groupOrder}`) ? '▴' : '▾'}
                                </span>
                            </button>
                        </div>
                        <div className={`filter-section-body ${isSectionOpen(`group-${groupOrder}`) ? 'open' : 'collapsed'}`}>
                            {group.filterAttributes?.map(attr => (
                                <div key={attr.code} className="filter-sub-section">
                                    <div className="filter-sub-section-header">
                                        <span className="filter-attr-name">
                                            {attr.attributeName}{attr.unit ? ` (${attr.unit})` : ''}
                                        </span>
                                        <button
                                            type="button"
                                            className="filter-section-toggle filter-section-toggle--small filter-section-toggle--attr"
                                            onClick={() => toggleSection(`attr-${attr.code}`)}
                                            title={`Thu gon/mo rong thuoc tinh: ${attr.attributeName}`}
                                            aria-label={`Thu gon/mo rong thuoc tinh ${attr.attributeName}`}
                                        >
                                            <span className={`filter-section-toggle-icon ${isSectionOpen(`attr-${attr.code}`) ? 'open' : ''}`}>
                                                {isSectionOpen(`attr-${attr.code}`) ? '▴' : '▾'}
                                            </span>
                                        </button>
                                    </div>
                                    <div className={`filter-options ${isSectionOpen(`attr-${attr.code}`) ? 'open' : 'collapsed'}`}>
                                        {(attr.displayOptions || buildDisplayOptions(attr)).map((option) => {
                                            const selectedValues = selectedFilters[attr.code] || [];
                                            const isChecked = option.values.every((value) => selectedValues.includes(value));

                                            return (
                                                <label key={option.key} className="filter-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => handleAttributeChange(attr.code, option.values, e.target.checked)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {isOpen && <div className="filter-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
}

export default FilterSidebar;
