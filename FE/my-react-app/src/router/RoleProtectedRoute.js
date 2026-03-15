import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../api/AuthAPI';

/**
 * RoleProtectedRoute – only allows users whose role is in the `allowedRoles` array.
 * Falls back to /login if not authenticated, or /unauthorized if wrong role.
 */
function RoleProtectedRoute({ children, allowedRoles = [] }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const { role } = getCurrentUser();
    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RoleProtectedRoute;

