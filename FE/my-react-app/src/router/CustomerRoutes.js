import React from 'react';
import { Route } from 'react-router-dom';
import Home from "../pages/customer/homepage/Home";
import Login from "../pages/login/Login";
import Register from "../pages/login/Register";
import ForgotPassword from "../pages/login/ForgotPassword";
import AboutMe from "../pages/customer/aboutme/AboutMe";
import Cart from "../pages/customer/Cart/Cart";
import Profile from "../pages/customer/profile/Profile";
import Order from "../pages/customer/order/Order";
import ProductDetail from "../pages/customer/productdetail/ProductDetail";
import OrderHistory from "../pages/customer/orderhistory/OrderHistory";
import ProtectedRoute from "./ProtectedRoute";
import PaymentResult from "../pages/customer/paymentresult/PaymentResult";
import WaitingVerification from "../pages/verifyemail/WaitingVerification";
import VerificationHelp from "../pages/verifyemail/VerificationHelp";
import Compare from "../pages/customer/compare/Compare";

const CustomerRoutes = () => [
    // ...existing code...
    <Route key="home" path="/" element={<Home/>}/>,
    <Route key="login" path="/login" element={<Login/>}/>,
    <Route key="register" path="/register" element={<Register/>}/>,
    <Route key="forgot-password" path="/forgot-password" element={<ForgotPassword/>}/>,
    <Route key="waiting-verification" path="/waiting-verification" element={<WaitingVerification/>}/>,
    <Route key="verification-help" path="/verification-help" element={<VerificationHelp/>}/>,
    <Route key="aboutme" path="/aboutme" element={<AboutMe/>}/>,
    <Route key="product" path="/product/:id" element={<ProductDetail/>}/>,
    <Route key="compare" path="/compare" element={<Compare/>}/>,

    // Protected Routes - Require Authentication
    <Route key="cart" path="/cart" element={
        <ProtectedRoute>
            <Cart/>
        </ProtectedRoute>
    }/>,
    <Route key="profile" path="/profile" element={
        <ProtectedRoute>
            <Profile/>
        </ProtectedRoute>
    }/>,
    <Route key="checkout" path="/checkout" element={
        <ProtectedRoute>
            <Order/>
        </ProtectedRoute>
    }/>,
    <Route key="orders" path="/orders" element={
        <ProtectedRoute>
            <OrderHistory/>
        </ProtectedRoute>
    }/>,
    <Route key="orderhistory" path="/orderhistory" element={
        <ProtectedRoute>
            <OrderHistory/>
        </ProtectedRoute>
    }/>,
    <Route key="payment-result" path="/payment-result" element={<PaymentResult/>}/>,
];

export default CustomerRoutes;

