import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Home from "../pages/homepage/Home";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from "../pages/login/Login";
import Register from "../pages/login/Register";
import ForgotPassword from "../pages/login/ForgotPassword";
import AboutMe from "../pages/aboutme/AboutMe";
import Cart from "../pages/Cart/Cart";
import Profile from "../pages/profile/Profile";
import Order from "../pages/order/Order";
import ProductDetail from "../pages/productdetail/ProductDetail";
import OrderHistory from "../pages/orderhistory/OrderHistory";
import ProtectedRoute from "./ProtectedRoute";
import PaymentResult from "../pages/paymentresult/PaymentResult";
import WaitingVerification from "../pages/verifyemail/WaitingVerification";
import VerificationHelp from "../pages/verifyemail/VerificationHelp";
import Compare from "../pages/compare/Compare";


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
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/waiting-verification" element={<WaitingVerification/>}/>
                <Route path="/verification-help" element={<VerificationHelp/>}/>
                <Route path="/aboutme" element={<AboutMe/>}/>
                <Route path="/product/:id" element={<ProductDetail/>}/>
                <Route path="/compare" element={<Compare/>}/>

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
                <Route path="/orders" element={
                    <ProtectedRoute>
                        <OrderHistory/>
                    </ProtectedRoute>
                }/>
                <Route path="/orderhistory" element={
                    <ProtectedRoute>
                        <OrderHistory/>
                    </ProtectedRoute>
                }/>
                <Route path="/payment-result" element={<PaymentResult/>}/>
            </Routes>
        </Router>
    );
}

export default RouterPages;
