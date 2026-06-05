import apiClient, { BASE_URL, getAccessToken } from './apiClient';
import { EventSourcePolyfill } from "event-source-polyfill";

export const getUnreadNotificationCount = (context) => {
    return apiClient.get(`/notifications/unread-count?context=${context}`).then(res => res.data);
};

export const getNotifications = (context, params = {}) => {
    // params: { type: 'NEW_ORDER', page: 0, size: 10 }
    return apiClient.get(`/notifications`, { params: { context, ...params } }).then(res => res.data);
};

export const getAvailableTypes = (context) => {
    return apiClient.get(`/notifications/types?context=${context}`).then(res => res.data);
};

export const markNotificationAsRead = (id, context) => {
    return apiClient.put(`/notifications/${id}/read?context=${context}`).then(res => res.data);
};

export const markAllNotificationsAsRead = (context) => {
    return apiClient.put(`/notifications/read-all?context=${context}`).then(res => res.data);
};

export const subscribeNotification = () => {
    return new EventSourcePolyfill(`${BASE_URL}/notifications/subscribe`, {
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`
        }
    });
};

export default {
    getUnreadNotificationCount,
    getNotifications,
    getAvailableTypes,
    markNotificationAsRead,
    markAllNotificationsAsRead
};