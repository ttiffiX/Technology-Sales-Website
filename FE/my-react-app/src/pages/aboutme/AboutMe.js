import React from "react";
import './AboutMe.scss'
import Nav from "../../components/navigation/Nav";
import {useCart} from "../../contexts/CartContext";

function AboutMe() {
    const {cartCount} = useCart();
    return (
        <>
            <Nav count={cartCount}/>
            <div className="AboutMe_title">Hello, i'm Sang</div>
        </>

    );
}

export default AboutMe
