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
                setFilterOptions(options);

                // Restore UI state từ URL (chỉ để hiển thị đúng checkbox/sort/price)
                // Home.js đã lo việc gọi API lấy sản phẩm rồi
                const minPrice = searchParams.get('minPrice');
                const maxPrice = searchParams.get('maxPrice');
                const urlSort = searchParams.get('sort');

                const defaultMin = minPrice ? parseInt(minPrice) : 0;
                const defaultMax = maxPrice ? parseInt(maxPrice) : 100000000;
                setPriceRange({ min: defaultMin, max: defaultMax });
                setTempPriceRange({ min: defaultMin, max: defaultMax });
                if (urlSort) setSort(urlSort);
                else setSort('price_asc');

                const systemKeys = new Set(['category', 'minPrice', 'maxPrice', 'sort', 'search', 'page', 'size']);
                const attributes = {};
                searchParams.forEach((value, key) => {
                    if (!systemKeys.has(key)) attributes[key] = value.split(',');
                });
                setSelectedFilters(attributes);

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
            maxPrice: priceRange.max < 100000000 ? priceRange.max : undefined,
            sort,
            attributes: selectedFilters,
            ...overrides
        };
        onFilterChange(filters);
    };

    const handleAttributeChange = (attributeId, value, checked) => {
        const current = selectedFilters[attributeId] || [];
        let updated;
        if (checked) {
            updated = { ...selectedFilters, [attributeId]: [...current, value] };
        } else {
            const filtered = current.filter(v => v !== value);
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
                       maxPrice: tempPriceRange.max < 100000000 ? tempPriceRange.max : undefined });
    };

    const resetFilters = () => {
        setSelectedFilters({});
        setPriceRange({ min: 0, max: 100000000 });
        setTempPriceRange({ min: 0, max: 100000000 });
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
                    <h4>Sort by price</h4>
                    <select value={sort} onChange={(e) => handleSortChange(e.target.value)} className="sort-select">
                        <option value="price_asc">Price: low → high</option>
                        <option value="price_desc">Price: high → low</option>
                    </select>
                </div>

                {/* Price range */}
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

                {/* Attribute filters */}
                {filterOptions && Object.entries(filterOptions).map(([groupOrder, group]) => (
                    <div key={groupOrder} className="filter-section">
                        <h4 className="filter-group-name">{group.groupName}</h4>
                        {group.filterAttributes?.map(attr => (
                            <div key={attr.code} className="filter-sub-section">
                                <span className="filter-attr-name">
                                    {attr.attributeName}{attr.unit ? ` (${attr.unit})` : ''}
                                </span>
                                <div className="filter-options">
                                    {attr.availableValues?.map(value => (
                                        <label key={value} className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilters[attr.code]?.includes(value) || false}
                                                onChange={(e) => handleAttributeChange(attr.code, value, e.target.checked)}
                                            />
                                            <span>{value}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {isOpen && <div className="filter-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
}

export default FilterSidebar;
