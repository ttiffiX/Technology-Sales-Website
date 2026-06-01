import React from 'react';
import {Outlet} from 'react-router-dom';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import './PMDashboard.scss';

function PMDashboard() {
    const pmNavItems = [
        {
            key: 'products',
            label: 'Products',
            path: '/pm/products',
            alwaysExpanded: true,
            children: [
                {label: 'Product List', path: '/pm/products/list'},
                {label: 'Categories', path: '/pm/products/categories'},
                {label: 'Attributes', path: '/pm/products/attributes'},
                {label: 'Product Reviews', path: '/pm/products/reviews'},
            ]
        },
        {
            key: 'orders',
            label: 'Orders',
            path: '/pm/orders'
        }
    ];

    return (
        <div className="pm-dashboard">
            <DashboardSidebar brand="PM Panel" navItems={pmNavItems}/>

            <main className="pm-dashboard__content">
                <Outlet/>
            </main>
        </div>
    );
}

export default PMDashboard;

