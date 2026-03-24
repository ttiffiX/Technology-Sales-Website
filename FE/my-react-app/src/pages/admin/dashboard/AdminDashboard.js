import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../../api/AuthAPI';
import { truncateText } from '../../../utils';
import './AdminDashboard.scss';

function AdminDashboard() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const user = getCurrentUser();
    const displayName = useMemo(() => truncateText(user?.name || user?.username || 'Admin', 20), [user]);
    const avatarLabel = useMemo(() => displayName.trim().charAt(0).toUpperCase(), [displayName]);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-dashboard__sidebar">
                <div className="admin-dashboard__topbar">
                    <div className="admin-dashboard__brand">Admin Panel</div>

                    <div className="admin-dashboard__account">
                        <button
                            type="button"
                            className="admin-dashboard__account-btn"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label="Open account menu"
                        >
                            <span className="admin-dashboard__avatar">{avatarLabel}</span>
                        </button>

                        {menuOpen && (
                            <div className="admin-dashboard__account-menu">
                                <div className="admin-dashboard__account-summary">{displayName}</div>
                                <button
                                    type="button"
                                    className="admin-dashboard__menu-item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate('/');
                                    }}
                                >
                                    Go to Store
                                </button>
                                <button
                                    type="button"
                                    className="admin-dashboard__menu-item admin-dashboard__menu-item--danger"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="admin-dashboard__nav">
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => `admin-dashboard__nav-item${isActive ? ' active' : ''}`}
                    >
                        User Management
                    </NavLink>

                    <NavLink
                        to="/admin/revenue"
                        className={({ isActive }) => `admin-dashboard__nav-item${isActive ? ' active' : ''}`}
                    >
                        Revenue
                    </NavLink>
                </nav>
            </aside>

            <main className="admin-dashboard__content">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminDashboard;


