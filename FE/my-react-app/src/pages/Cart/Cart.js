import React, {useEffect, useState} from "react";
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import CartGrid from "../../components/cartgrid/CartGrid";
import {getCartItems} from "../../api/CartAPI";

function Cart(){
    const { cartItems,totalQuantity, loading, error } = getCartItems();
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(totalQuantity);
    }, [totalQuantity]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    return(
        <>
            <Nav count={count}/>
            <Header
                title="Cart"
                modeDisplay={"cart"}
            />
            <CartGrid products={cartItems} count={setCount}/>
        </>
    )
}
export default Cart