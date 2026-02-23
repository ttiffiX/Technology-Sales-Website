import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Tạo axios instance với config chung
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động thêm token vào header cho mọi request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('name');
            localStorage.removeItem('imageUrl');
            localStorage.removeItem('role')
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
