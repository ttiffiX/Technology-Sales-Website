import React from "react";
import './AboutMe.scss'
import Nav from "../../components/navigation/Nav";
import {getCartItems} from "../../api/CartAPI";

function AboutMe() {
    const {totalQuantity} = getCartItems();
    return (
        <>
            <Nav count={totalQuantity}/>
            <div className="AboutMe_title">Hello, i'm Sang</div>
        </>

    );
}

export default AboutMe
