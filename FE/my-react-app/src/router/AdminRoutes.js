import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleProtectedRoute from './RoleProtectedRoute';
import AdminDashboard from '../pages/admin/dashboard/AdminDashboard';
import AdminUserManagement from '../pages/admin/users/AdminUserManagement';
import AdminRevenuePlaceholder from '../pages/admin/revenue/AdminRevenuePlaceholder';

const ADMIN_ROLES = ['ADMIN'];

const AdminRoutes = () => [
    <Route
        key="admin-layout"
        path="/admin"
        element={
            <RoleProtectedRoute allowedRoles={ADMIN_ROLES}>
                <AdminDashboard />
            </RoleProtectedRoute>
        }
    >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="revenue" element={<AdminRevenuePlaceholder />} />
    </Route>,
];

export default AdminRoutes;

