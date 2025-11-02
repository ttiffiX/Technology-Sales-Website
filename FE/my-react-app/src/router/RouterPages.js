import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Home from "../pages/homepage/Home";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from "../pages/login/Login";
import Register from "../pages/login/Register";
import AboutMe from "../pages/aboutme/AboutMe";
import Cart from "../pages/Cart/Cart";
import Profile from "../pages/profile/Profile";
import Order from "../pages/order/Order";
import PlacedOrder from "../pages/placedorder/PlacedOrder";


function RouterPages() {
    return (
        <Router future={{
            v7_relativeSplatPath: true, // Bật thay đổi liên quan đến splat path
            v7_startTransition: true,  // Bật sử dụng React.startTransition
        }}>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/aboutme" element={<AboutMe/>}/>
                <Route path="/cart" element={<Cart/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/checkout" element={<Order/>}/>
                <Route path="/placedorder" element={<PlacedOrder/>}/>
            </Routes>
        </Router>
    );
}

export default RouterPages;
