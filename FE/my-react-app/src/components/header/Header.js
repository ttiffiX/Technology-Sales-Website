import React from "react";
import './Header.scss'

function Header({
                    title,
                    onSearch,
                    selectedCategoryId,
                    onCategoryChange,
                    categories = [],
                    modeDisplay
                }) {

    const [searchText, setSearchText] = React.useState('');

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchText);
        }
    };

    // Add "All Products" option to categories
    const allCategories = [
        { id: null, name: 'All products' },
        ...categories
    ];

    return modeDisplay === "product" ? (
        <div className={"header"}>
            <div className={"product"}>
                <span>{title}</span>
            </div>
            {/*<HandleDate/>*/}

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchText}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    Search
                </button>
            </form>

            {/* Category Selector */}
            <div className={"category-selector"}>
                <label>Category:</label>
                <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
                    className="category-dropdown"
                >
                    {allCategories.map(cat => (
                        <option key={cat.id || 'all'} value={cat.id || ''}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={"divider"}/>
        </div>
    ) : (
        <div className={"header"}>
            <div className={"product"}>
                <span>{title}</span>
            </div>
            {/*<HandleDate/>*/}
            <div className={"divider"}/>
        </div>
    );
}

export default Header