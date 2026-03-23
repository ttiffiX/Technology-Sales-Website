import React from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from "./RoleProtectedRoute";
import PMDashboard from "../pages/pm/dashboard/PMDashboard";
import PMProductHub from "../pages/pm/products/PMProductHub";
import PMProductManagement from "../pages/pm/products/PMProductManagement";
import PMProductDetail from "../pages/pm/products/PMProductDetail";
import PMOrderManagement from "../pages/pm/orders/PMOrderManagement";
import PMAttributeSchemaManagement from "../pages/pm/products/attributes/PMAttributeSchemaManagement";
import PMCategoryManagement from "../pages/pm/products/categories/PMCategoryManagement";

const PM_ROLES = ['ADMIN', 'PM'];

const PMRoutes = () => [
    // ...existing code...
    <Route key="pm-dashboard" path="/pm" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMDashboard/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-products" path="/pm/products" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMProductHub/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-products-list" path="/pm/products/list" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMProductManagement/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-products-detail" path="/pm/products/list/:productId" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMProductDetail/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-orders" path="/pm/orders" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMOrderManagement/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-attributes" path="/pm/attributes" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMAttributeSchemaManagement/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-products-attributes" path="/pm/products/attributes" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMAttributeSchemaManagement/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-categories" path="/pm/categories" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMCategoryManagement/>
        </RoleProtectedRoute>
    }/>,
    <Route key="pm-products-categories" path="/pm/products/categories" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMCategoryManagement/>
        </RoleProtectedRoute>
    }/>,
];

export default PMRoutes;

