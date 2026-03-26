import React from 'react';
import { Route, Navigate } from 'react-router-dom';
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
    <Route key="pm-dashboard" path="/pm" element={
        <RoleProtectedRoute allowedRoles={PM_ROLES}>
            <PMDashboard/>
        </RoleProtectedRoute>
    } children={
        [
            <Route key="pm-dashboard-home" path="" element={<Navigate to="/pm/products" replace />} />,
            <Route key="pm-products-detail" path="products/list/:productId" element={
                <RoleProtectedRoute allowedRoles={PM_ROLES}>
                    <PMProductDetail/>
                </RoleProtectedRoute>
            }/>,
            <Route key="pm-products-list" path="products/list" element={
                <RoleProtectedRoute allowedRoles={PM_ROLES}>
                    <PMProductManagement/>
                </RoleProtectedRoute>
            }/>,
            <Route key="pm-products" path="products" element={
                <RoleProtectedRoute allowedRoles={PM_ROLES}>
                    <PMProductHub/>
                </RoleProtectedRoute>
            }/>,
            <Route key="pm-categories" path="categories" element={
                <RoleProtectedRoute allowedRoles={PM_ROLES}>
                    <PMCategoryManagement/>
                </RoleProtectedRoute>
            }/>,
            <Route key="pm-attributes" path="attributes" element={
                <RoleProtectedRoute allowedRoles={PM_ROLES}>
                    <PMAttributeSchemaManagement/>
                </RoleProtectedRoute>
            }/>,
            <Route key="pm-orders" path="orders" element={
                <RoleProtectedRoute allowedRoles={PM_ROLES}>
                    <PMOrderManagement/>
                </RoleProtectedRoute>
            }/>
        ]
    }/>,
];

export default PMRoutes;

