import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../api/AuthAPI';
import { truncateText } from '../../utils';
import { useToast } from '../Toast/Toast';
import './DashboardSidebar.scss';

function DashboardSidebar({ brand = 'Dashboard', navItems = [] }) {
    const navigate = useNavigate();
    const { triggerToast } = useToast();
    const [expandedItems, setExpandedItems] = useState(() => {
        const initial = {};
        navItems.forEach(item => {
            if (item.alwaysExpanded) {
                initial[item.key] = true;
            }
        });
        return initial;
    });

    const user = getCurrentUser();
    const displayName = useMemo(() => truncateText(user?.name || user?.username || 'User', 20), [user]);
    const avatarLabel = useMemo(() => displayName.trim().charAt(0).toUpperCase(), [displayName]);

    const handleLogout = async () => {
        try {
            await logout();
            triggerToast('success', 'Logout successfully');
            navigate('/login', { replace: true });
        } catch (error) {
            triggerToast('error', 'Logout failed');
        }
    };

    const toggleExpand = (itemKey) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemKey]: !prev[itemKey]
        }));
    };

    return (
        <aside className="dashboard-sidebar">
            <div className="dashboard-sidebar__topbar">
                <div className="dashboard-sidebar__brand">{brand}</div>

                <div className="dashboard-sidebar__account">
                    <div className="dashboard-sidebar__account-btn">
                        <span className="dashboard-sidebar__avatar">{avatarLabel}</span>
                    </div>
                </div>
            </div>

            <nav className="dashboard-sidebar__nav">
                {navItems.map((item) => {
                    if (item.children && item.children.length > 0) {
                        const isExpanded = expandedItems[item.key];
                        return (
                            <div key={item.key} className="dashboard-sidebar__nav-group">
                                {item.alwaysExpanded && item.path ? (
                                    <NavLink
                                        end
                                        to={item.path}
                                        className={({ isActive }) => 
                                            `dashboard-sidebar__nav-item dashboard-sidebar__nav-item--parent dashboard-sidebar__nav-item--no-toggle${isActive ? ' active' : ''}`
                                        }
                                    >
                                        <span className="dashboard-sidebar__nav-item-text">{item.label}</span>
                                    </NavLink>
                                ) : item.alwaysExpanded ? (
                                    <div className="dashboard-sidebar__nav-item dashboard-sidebar__nav-item--parent dashboard-sidebar__nav-item--no-toggle">
                                        <span className="dashboard-sidebar__nav-item-text">{item.label}</span>
                                    </div>
                                ) : (
                                <button
                                    type="button"
                                    className="dashboard-sidebar__nav-item dashboard-sidebar__nav-item--parent"
                                    onClick={() => toggleExpand(item.key)}
                                >
                                    <span className="dashboard-sidebar__nav-item-text">{item.label}</span>
                                    <span className={`dashboard-sidebar__nav-item-arrow${isExpanded ? ' expanded' : ''}`}>
                                        ›
                                    </span>
                                </button>
                                )}
                                {(isExpanded || item.alwaysExpanded) && (
                                    <div className="dashboard-sidebar__nav-children">
                                        {item.children.map((child) => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                className={({ isActive }) =>
                                                    `dashboard-sidebar__nav-item dashboard-sidebar__nav-item--child${isActive ? ' active' : ''}`
                                                }
                                            >
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.key || item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `dashboard-sidebar__nav-item${isActive ? ' active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="dashboard-sidebar__footer">
                <button
                    type="button"
                    className="dashboard-sidebar__logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default DashboardSidebar;

