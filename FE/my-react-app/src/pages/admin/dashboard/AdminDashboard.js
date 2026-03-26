import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import './AdminDashboard.scss';

function AdminDashboard() {
    const adminNavItems = [
        {
            key: 'users',
            label: 'User Management',
            path: '/admin/users'
        },
        {
            key: 'revenue',
            label: 'Revenue',
            path: '/admin/revenue'
        }
    ];

    return (
        <div className="admin-dashboard">
            <DashboardSidebar brand="Admin Panel" navItems={adminNavItems} />

            <main className="admin-dashboard__content">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminDashboard;


