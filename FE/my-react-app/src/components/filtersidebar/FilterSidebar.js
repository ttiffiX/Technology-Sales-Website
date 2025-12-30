import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFilterOptions } from '../../api/ProductAPI';
import { formatPrice } from '../../utils';
import './FilterSidebar.scss';

function FilterSidebar({ categoryId, onFilterChange }) {
    const [searchParams] = useSearchParams();
    const [filterOptions, setFilterOptions] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000000 });
    const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 100000000 });
    const [sort, setSort] = useState('price_asc');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load filter options when category changes
    useEffect(() => {
        if (!categoryId) {
            setFilterOptions(null);
            setIsInitialized(false);
            return;
        }

        const loadFilterOptions = async () => {
            setLoading(true);
            try {
                const options = await getFilterOptions(categoryId);
                setFilterOptions(options);

                // Restore filters from URL only on first load
                if (!isInitialized) {
                    const minPrice = searchParams.get('minPrice');
                    const maxPrice = searchParams.get('maxPrice');
                    const urlSort = searchParams.get('sort');

                    const defaultMin = minPrice ? parseInt(minPrice) : 0;
                    const defaultMax = maxPrice ? parseInt(maxPrice) : 100000000;

                    setPriceRange({ min: defaultMin, max: defaultMax });
                    setTempPriceRange({ min: defaultMin, max: defaultMax });

                    if (urlSort) {
                        setSort(urlSort);
                    }

                    // Restore attribute filters
                    const attributes = {};
                    searchParams.forEach((value, key) => {
                        if (key.startsWith('attr_')) {
                            const attrId = key.substring(5);
                            attributes[attrId] = value.split(',');
                        }
                    });
                    setSelectedFilters(attributes);

                    setIsInitialized(true);
                } else {
                    // Reset to default when switching categories
                    setSelectedFilters({});
                    const defaultMin = 0;
                    const defaultMax = 100000000;
                    setPriceRange({ min: defaultMin, max: defaultMax });
                    setTempPriceRange({ min: defaultMin, max: defaultMax });
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

    // Handle attribute filter change
    const handleAttributeChange = (attributeId, value, checked) => {
        setSelectedFilters(prev => {
            const current = prev[attributeId] || [];
            if (checked) {
                return { ...prev, [attributeId]: [...current, value] };
            } else {
                const updated = current.filter(v => v !== value);
                if (updated.length === 0) {
                    const { [attributeId]: removed, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [attributeId]: updated };
            }
        });
    };

    // Apply filters
    const applyFilters = () => {
        const filters = {
            minPrice: priceRange.min > 0 ? priceRange.min : undefined,
            maxPrice: priceRange.max < 100000000 ? priceRange.max : undefined,
            sort: sort,
            attributes: selectedFilters
        };
        onFilterChange(filters);
    };

    // Reset filters
    const resetFilters = () => {
        setSelectedFilters({});
        setPriceRange({ min: 0, max: 100000000 });
        setTempPriceRange({ min: 0, max: 100000000 });
        setSort('price_asc');
        onFilterChange({ sort: 'price_asc' });
    };

    // Handle price range slider change (only update temp value)
    const handlePriceSliderChange = (type, value) => {
        setTempPriceRange(prev => ({
            ...prev,
            [type]: parseInt(value)
        }));
    };

    // Apply price range when user releases slider
    const handlePriceSliderRelease = () => {
        setPriceRange(tempPriceRange);
    };

    // Auto apply when filters change (except temp price range)
    useEffect(() => {
        if (categoryId) {
            applyFilters();
        }
    }, [selectedFilters, priceRange, sort]);

    if (!categoryId) {
        return null;
    }

    if (loading) {
        return (
            <div className="filter-sidebar">
                <div className="filter-loading">Loading filters...</div>
            </div>
        );
    }


    return (
        <>
            {/* Toggle button for mobile */}
            <button className="filter-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                <span className="filter-icon">⚙️</span>
                Filters
            </button>

            <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Close button for mobile */}
                <button className="filter-close-btn" onClick={() => setIsOpen(false)}>
                    ✕
                </button>

                <div className="filter-header">
                    <h3>Filters</h3>
                    <button onClick={resetFilters} className="reset-btn">
                        Clear filters
                    </button>
                </div>

                {/* Sort by price */}
                <div className="filter-section">
                    <h4>Sort by price</h4>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
                        <option value="price_asc">Price: low → high</option>
                        <option value="price_desc">Price: high → low</option>
                    </select>
                </div>

                {/* Price range with sliders */}
                <div className="filter-section">
                    <h4>Price range</h4>
                    <div className="price-display">
                        <span>{formatPrice(tempPriceRange.min)}</span>
                        <span>-</span>
                        <span>{formatPrice(tempPriceRange.max)}</span>
                    </div>
                    <div className="price-sliders">
                        <div className="slider-container">
                            <label>From:</label>
                            <input
                                type="range"
                                min="0"
                                max="100000000"
                                step="1000000"
                                value={tempPriceRange.min}
                                onChange={(e) => handlePriceSliderChange('min', e.target.value)}
                                onMouseUp={handlePriceSliderRelease}
                                onTouchEnd={handlePriceSliderRelease}
                                className="price-slider"
                            />
                        </div>
                        <div className="slider-container">
                            <label>To:</label>
                            <input
                                type="range"
                                min="0"
                                max="100000000"
                                step="1000000"
                                value={tempPriceRange.max}
                                onChange={(e) => handlePriceSliderChange('max', e.target.value)}
                                onMouseUp={handlePriceSliderRelease}
                                onTouchEnd={handlePriceSliderRelease}
                                className="price-slider"
                            />
                        </div>
                    </div>
                </div>

                {/* Attribute filters */}
                {filterOptions?.filterableAttributes?.map(attr => (
                    <div key={attr.attributeId} className="filter-section">
                        <h4>{attr.attributeName}</h4>
                        <div className="filter-options">
                            {attr.availableValues.map(value => {
                                const isChecked = selectedFilters[attr.attributeId]?.includes(value) || false;
                                return (
                                    <label key={value} className="filter-option">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => handleAttributeChange(attr.attributeId, value, e.target.checked)}
                                        />
                                        <span>{value} {attr.unit || ''}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Overlay for mobile */}
            {isOpen && <div className="filter-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
}

export default FilterSidebar;
