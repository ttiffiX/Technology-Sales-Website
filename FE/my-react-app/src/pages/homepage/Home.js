import React, {useEffect, useState} from 'react';
import '../../App.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css';
import ProductGrid from "../../components/productgrid/ProductGrid";
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import useProductFilter from "../../hooks/useProductFilter";
import useFetchProducts from "../../api/ProductAPI";
import {getCartItems} from "../../api/CartAPI";



function Home() {
    const {products, loading, error} = useFetchProducts();
    const [count, setCount] = useState(0);
    const {
        activeOrder,
        selectedCategory,
        filteredProducts,
        handleFilterChange,
        handleSort,
        handleCategoryChange,
    } = useProductFilter(products);

    const {totalQuantity} = getCartItems();

    useEffect(() => {
        // Cập nhật state count khi lấy được totalQuantity từ API
        setCount(totalQuantity);
    }, [totalQuantity]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    return (
            <div className={"MyApp"}>
                <Nav count={count}/>

                <Header
                    title="Product"
                    onFilterChange={handleFilterChange}
                    activeOrder={activeOrder}
                    handleSort={handleSort}
                    selectedCategory={selectedCategory}
                    handleCategoryChange={handleCategoryChange}
                    modeDisplay={"product"}
                />


                <ProductGrid products={filteredProducts} count={setCount}/>
            </div>
    );
}

export default Home