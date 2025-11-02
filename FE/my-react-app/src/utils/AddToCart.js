import React from 'react';
import {useToast} from "../components/Toast/Toast";
import {addCartItem, fetchCartItems} from "../api/CartAPI";


function AddToCart({product_id, count, stocked}) {

    const maxCart = 10;
    const {triggerToast} = useToast();
    const {addItem, loading} = addCartItem();

    const refreshCart = async () => {
        try {
            const {totalQuantity} = await fetchCartItems();
            count(totalQuantity);
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
        }
    };

    const handleAddToCart = async () => {
        try {
            const {totalQuantity} = await fetchCartItems();
            if (totalQuantity >= maxCart) {
                triggerToast("error", "Too muchhhh!!!");
            } else {
                const response = await addItem(product_id, 1); // Gửi request với số lượng = 1
                console.log(response);

                if (response) {
                    triggerToast("success", response);
                    await refreshCart();
                }
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            triggerToast("error", err);
        }
    };


    if (loading) return <p>Adding...</p>;

    return (
        <button
            className={`addToCart ${!stocked ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!stocked}
        >
            Add To Cart
        </button>
    );
}

export default AddToCart;
