import axios from 'axios';

export const BASE_URL = 'http://localhost:8080';

let _accessToken = null;

export const setAccessToken = (token) => {
    _accessToken = token;
};
export const getAccessToken = () => _accessToken;
export const clearAccessToken = () => {
    _accessToken = null;
};

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true,
});

// Request interceptor: đính access token vào header
apiClient.interceptors.request.use(
    (config) => {
        if (_accessToken) {
            config.headers.Authorization = `Bearer ${_accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((p) => error ? p.reject(error) : p.resolve(token));
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Chỉ xử lý 401, không retry chính endpoint /auth/*
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/')
        ) {
            if (isRefreshing) {
                // Có request khác đang refresh → đưa vào hàng đợi
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi refresh-token — browser tự gửi HttpOnly Cookie
                const res = await axios.post(
                    `${BASE_URL}/auth/refresh-token`,
                    {},
                    {withCredentials: true}
                );
                const newToken = res.data.accessToken;
                setAccessToken(newToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearLocalStorage();
                clearAccessToken();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

function clearLocalStorage() {
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('imageUrl');
    localStorage.removeItem('role');
}

export default apiClient;
