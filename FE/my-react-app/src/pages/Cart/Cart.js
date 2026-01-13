import React, {useEffect} from "react";
import Nav from "../../components/navigation/Nav";
import Header from "../../components/header/Header";
import CartGrid from "../../components/cartgrid/CartGrid";
import {useGetCartItems} from "../../api/CartAPI";
import {useCart} from "../../contexts/CartContext";

function Cart(){
    const { cartItems, totalQuantity, loading, error } = useGetCartItems();
    const { cartCount, updateCartCount } = useCart();

    // Update context cart count when cart items change
    useEffect(() => {
        updateCartCount(totalQuantity);
    }, [totalQuantity, updateCartCount]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    return(
        <>
            <Nav count={cartCount}/>
            <Header
                title="Cart"
                modeDisplay={"cart"}
            />
            <CartGrid products={cartItems} count={updateCartCount}/>
        </>
    )
}
export default Cart