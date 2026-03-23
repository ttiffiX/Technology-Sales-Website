import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Home from "../pages/customer/homepage/Home";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
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
import RoleProtectedRoute from "./RoleProtectedRoute";
import PaymentResult from "../pages/customer/paymentresult/PaymentResult";
import WaitingVerification from "../pages/verifyemail/WaitingVerification";
import VerificationHelp from "../pages/verifyemail/VerificationHelp";
import Compare from "../pages/customer/compare/Compare";
import PMDashboard from "../pages/pm/dashboard/PMDashboard";
import PMProductHub from "../pages/pm/products/PMProductHub";
import PMProductManagement from "../pages/pm/products/PMProductManagement";
import PMProductDetail from "../pages/pm/products/PMProductDetail";
import PMOrderManagement from "../pages/pm/orders/PMOrderManagement";
import PMAttributeSchemaManagement from "../pages/pm/products/attributes/PMAttributeSchemaManagement";
import PMCategoryManagement from "../pages/pm/products/categories/PMCategoryManagement";

const PM_ROLES = ['ADMIN', 'PM'];

function RouterPages() {
    return (
        <Router future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
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

                {/* PM / Admin Routes - Only ADMIN and PM roles allowed */}
                <Route path="/pm" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMDashboard/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/products" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMProductHub/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/products/list" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMProductManagement/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/products/list/:productId" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMProductDetail/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/orders" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMOrderManagement/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/attributes" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMAttributeSchemaManagement/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/products/attributes" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMAttributeSchemaManagement/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/categories" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMCategoryManagement/>
                    </RoleProtectedRoute>
                }/>
                <Route path="/pm/products/categories" element={
                    <RoleProtectedRoute allowedRoles={PM_ROLES}>
                        <PMCategoryManagement/>
                    </RoleProtectedRoute>
                }/>
            </Routes>
        </Router>
    );
}

export default RouterPages;
