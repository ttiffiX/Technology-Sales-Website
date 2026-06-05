import React, {useEffect, useMemo, useState, useRef} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import {getCurrentUser, logout} from '../../api/AuthAPI';
import NotificationAPI, {subscribeNotification} from '../../api/NotificationAPI';
import {truncateText, formatDate} from '../../utils';
import {formatNotificationType} from '../../utils';
import {useToast} from '../Toast/Toast';
import './DashboardSidebar.scss';
import notificationIcon from "../../assets/icon/notification.png";

function DashboardSidebar({brand = 'Dashboard', navItems = [], contextRole}) {
    const navigate = useNavigate();
    const {triggerToast} = useToast();
    const dropdownRef = useRef(null);

    const [unreadCount, setUnreadCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [availableTypes, setAvailableTypes] = useState([]);
    const [activeTab, setActiveTab] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingNoti, setLoadingNoti] = useState(false);

    const [expandedItems, setExpandedItems] = useState(() => {
        const initial = {};
        navItems.forEach(item => {
            if (item.alwaysExpanded) initial[item.key] = true;
        });
        return initial;
    });

    const user = getCurrentUser();
    const displayName = useMemo(() => truncateText(user?.name || user?.username || 'User', 20), [user]);
    const avatarLabel = useMemo(() => displayName.trim().charAt(0).toUpperCase(), [displayName]);

    useEffect(() => {
        if (!user || contextRole == null) return;

        NotificationAPI.getUnreadNotificationCount(contextRole)
            .then(count => setUnreadCount(count))
            .catch(err => console.error("Failed to fetch unread count", err));

        NotificationAPI.getAvailableTypes(contextRole)
            .then(types => setAvailableTypes(types))
            .catch(err => console.error("Failed to fetch types", err));

        const eventSource = subscribeNotification();
        eventSource.addEventListener('NEW_NOTIFICATION', (event) => {
            try {
                triggerToast('notification', event.data);
                setUnreadCount(prev => prev + 1);
            } catch (error) {
                console.error("Error parsing notification data", error);
            }
        });

        eventSource.onerror = (error) => eventSource.close();

        return () => eventSource.close();
    }, [user?.username, contextRole, triggerToast]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotificationsList = async (resetPage = false, type = activeTab) => {
        if (contextRole == null) return;
        setLoadingNoti(true);
        const currentPage = resetPage ? 0 : page;

        try {
            const params = {page: currentPage, size: 10};
            if (type) params.type = type;

            const data = await NotificationAPI.getNotifications(contextRole, params);

            setNotifications(prev => resetPage ? data.content : [...prev, ...data.content]);
            setHasMore(!data.last);
            setPage(currentPage + 1);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoadingNoti(false);
        }
    };

    useEffect(() => {
        if (isDropdownOpen) {
            fetchNotificationsList(true, activeTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDropdownOpen, activeTab, contextRole]);

    const handleToggleDropdown = () => setIsDropdownOpen(prev => !prev);

    const handleMarkAllAsRead = async () => {
        try {
            await NotificationAPI.markAllNotificationsAsRead(contextRole);
            setNotifications(prev => prev.map(n => ({...n, isRead: true})));
            setUnreadCount(0);
        } catch (error) {
            triggerToast('error', 'Failed to mark all as read');
        }
    };

    const handleMarkAsRead = async (e, id) => {
        if (e) e.stopPropagation();
        try {
            await NotificationAPI.markNotificationAsRead(id, contextRole);
            setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            triggerToast('error', 'Failed to mark as read');
        }
    };

    const handleNotificationClick = async (noti) => {
        if (!noti.isRead) {
            await handleMarkAsRead(null, noti.id);
        }
        setIsDropdownOpen(false);

        if (contextRole === 1) {
            if (noti.type === 'NEW_ORDER') {
                navigate(`/pm/orders?id=${noti.referenceId}`);
            } else if (noti.type === 'NEW_REVIEW') {
                navigate(`/pm/products/reviews?id=${noti.referenceId}`);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            triggerToast('success', 'Logout successfully');
            navigate('/login', {replace: true});
        } catch (error) {
            triggerToast('error', 'Logout failed');
        }
    };

    const toggleExpand = (itemKey) => {
        setExpandedItems(prev => ({...prev, [itemKey]: !prev[itemKey]}));
    };

    return (
        <aside className="dashboard-sidebar">
            <div className="dashboard-sidebar__topbar">
                <div className="dashboard-sidebar__brand">{brand}</div>
                <div className="dashboard-sidebar__actions">
                    <div className="dashboard-sidebar__bell-wrapper" ref={dropdownRef}>
                        <div className="bell-trigger" onClick={handleToggleDropdown}>
                            <img className="bell-icon" src={notificationIcon} alt="Notification"/>
                            {unreadCount > 0 && (
                                <span className="bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            )}
                        </div>

                        {isDropdownOpen && (
                            <div className="noti-dropdown">
                                <div className="noti-dropdown__header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button className="noti-mark-all-btn" onClick={handleMarkAllAsRead}>
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="noti-dropdown__tabs">
                                    <button
                                        className={`noti-tab ${activeTab === null ? 'active' : ''}`}
                                        onClick={() => setActiveTab(null)}
                                    >
                                        All
                                    </button>
                                    {availableTypes.map(type => (
                                        <button
                                            key={type}
                                            className={`noti-tab ${activeTab === type ? 'active' : ''}`}
                                            onClick={() => setActiveTab(type)}
                                        >
                                            {formatNotificationType(type)}
                                        </button>
                                    ))}
                                </div>

                                <div className="noti-dropdown__list">
                                    {notifications.length === 0 && !loadingNoti ? (
                                        <div className="noti-empty">No notifications yet.</div>
                                    ) : (
                                        notifications.map(noti => (
                                            <div
                                                key={noti.id}
                                                className={`noti-item ${!noti.isRead ? 'unread' : ''}`}
                                                onClick={() => handleNotificationClick(noti)}
                                            >
                                                {!noti.isRead && <div className="noti-item__dot"></div>}
                                                <div className="noti-item__content">
                                                    {/* HÀNG HEADER CHỨA NHÃN TYPE VÀ THỜI GIAN */}
                                                    <div className="noti-item__header-row">
                                                        <span
                                                            className="noti-type-badge">
                                                            {formatNotificationType(noti.type)}
                                                        </span>
                                                        <span
                                                            className="noti-item__time">{formatDate(noti.createdAt)}</span>
                                                    </div>
                                                    <p>{noti.content}</p>
                                                </div>
                                                {!noti.isRead && (
                                                    <button
                                                        className="noti-item__read-btn"
                                                        onClick={(e) => handleMarkAsRead(e, noti.id)}
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                    {loadingNoti && <div className="noti-loading">Loading...</div>}
                                    {hasMore && !loadingNoti && (
                                        <button className="noti-load-more"
                                                onClick={() => fetchNotificationsList(false)}>
                                            Load older
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-sidebar__account">
                        <div className="dashboard-sidebar__account-btn">
                            <span className="dashboard-sidebar__avatar">{avatarLabel}</span>
                        </div>
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
                                        className={({isActive}) =>
                                            `dashboard-sidebar__nav-item dashboard-sidebar__nav-item--parent dashboard-sidebar__nav-item--no-toggle${isActive ? ' active' : ''}`
                                        }
                                    >
                                        <span className="dashboard-sidebar__nav-item-text">{item.label}</span>
                                    </NavLink>
                                ) : item.alwaysExpanded ? (
                                    <div
                                        className="dashboard-sidebar__nav-item dashboard-sidebar__nav-item--parent dashboard-sidebar__nav-item--no-toggle">
                                        <span className="dashboard-sidebar__nav-item-text">{item.label}</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="dashboard-sidebar__nav-item dashboard-sidebar__nav-item--parent"
                                        onClick={() => toggleExpand(item.key)}
                                    >
                                        <span className="dashboard-sidebar__nav-item-text">{item.label}</span>
                                        <span
                                            className={`dashboard-sidebar__nav-item-arrow${isExpanded ? ' expanded' : ''}`}>›</span>
                                    </button>
                                )}
                                {(isExpanded || item.alwaysExpanded) && (
                                    <div className="dashboard-sidebar__nav-children">
                                        {item.children.map((child) => (
                                            <NavLink
                                                key={child.path}
                                                to={child.path}
                                                className={({isActive}) =>
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
                            className={({isActive}) => `dashboard-sidebar__nav-item${isActive ? ' active' : ''}`}
                        >
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="dashboard-sidebar__footer">
                <button type="button" className="dashboard-sidebar__logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default DashboardSidebar;