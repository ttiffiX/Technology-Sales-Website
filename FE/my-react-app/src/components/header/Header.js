import HandleDate from "../../utils/HandleDate";
import SearchBar from "../searchbar/SearchBar";
import React from "react";
import './Header.scss'

function Header({
                    title,
                    onFilterChange,
                    activeOrder,
                    handleSort,
                    selectedCategory,
                    handleCategoryChange,
                    modeDisplay
                }) {

    return modeDisplay === "product" ? (
        <div className={"header"}>
            <div className={"product"}>
                <span>{title}</span>
            </div>
            <HandleDate/>
            <SearchBar onFilterChange={onFilterChange}/>

            <button
                className={`chip-price chip-price-asc ${activeOrder === 'asc' ? 'active' : ''}`}
                onClick={() => handleSort('asc')}
            >
                <span className="chip-price-text">Price ASC</span>
            </button>
            <button
                className={`chip-price chip-price-desc ${activeOrder === 'desc' ? 'active' : ''}`}
                onClick={() => handleSort('desc')}
            >
                <span className="chip-price-text">Price DESC</span>
            </button>

            <div className={"dropdown"}>
                <button className={"chip-list"}>
                    <span>List View</span>
                </button>

                <div className="dropdown-content">
                    <button
                        className={`category-btn ${selectedCategory === 'Laptop' ? 'active' : ''}`}
                        onClick={() => handleCategoryChange('Laptop')}>Laptop
                    </button>
                    <button className={`category-btn ${selectedCategory === 'Keyboard' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('Keyboard')}>Keyboard
                    </button>
                    <button
                        className={`category-btn ${selectedCategory === 'Mouse' ? 'active' : ''}`}
                        onClick={() => handleCategoryChange('Mouse')}>Mouse
                    </button>
                    <button
                        className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => handleCategoryChange('')}>All Products
                    </button>
                </div>
            </div>
            <div className={"divider"}/>
        </div>
    ) : (
        <div className={"header"}>
            <div className={"product"}>
                <span>{title}</span>
            </div>
            <HandleDate/>
            <div className={"divider"}/>
        </div>
    );
}

export default Header