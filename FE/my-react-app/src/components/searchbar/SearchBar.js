import React, {useState} from 'react';
import './SearchBar.scss';

function SearchBar({onFilterChange}) {
    const [searchText, setSearchText] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);

    const handleSearchTextChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        onFilterChange(value, inStockOnly); // Gọi hàm khi search text thay đổi
    };

    const handleInStockChange = (e) => {
        const checked = e.target.checked;
        setInStockOnly(checked);
        onFilterChange(searchText, checked); // Gọi hàm khi checkbox thay đổi
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={handleSearchTextChange}
                className="search-input"
            />
            <label className="in-stock-label">
                <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleInStockChange}
                />
                {' '}Only show products in stock
            </label>
        </div>
    );
}

export default SearchBar;
