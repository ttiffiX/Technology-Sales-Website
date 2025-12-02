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
import ProductDetail from "../pages/productdetail/ProductDetail";
import ProtectedRoute from "./ProtectedRoute";


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
                <Route path="/product/:id" element={<ProductDetail/>}/>

                {/* Protected Routes - Require Authentication */}
                <Route path="/cart" element={
                    <ProtectedRoute>
                        <Cart/>
                    </ProtectedRoute>
                }/>
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile/>
                    </ProtectedRoute>
                }/>
                <Route path="/checkout" element={
                    <ProtectedRoute>
                        <Order/>
                    </ProtectedRoute>
                }/>
                <Route path="/placedorder" element={
                    <ProtectedRoute>
                        <PlacedOrder/>
                    </ProtectedRoute>
                }/>
            </Routes>
        </Router>
    );
}

export default RouterPages;
