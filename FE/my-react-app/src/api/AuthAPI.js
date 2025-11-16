import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/auth';
const API_BASE_URL = 'http://localhost:8080/auth';
// Tạo axios instance với config chung
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động thêm token vào header cho mọi request
axiosInstance.interceptors.request.use(
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

// Hàm đăng nhập
export const login = async (username, password) => {
    try {
        const response = await axiosInstance.post('/login', {
            username,
            password,
        });

        // Lưu thông tin user và token vào localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('imageUrl', response.data.imageUrl || '');
        }

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response.data || 'Login failed. Please check your credentials.',
        };
    }
};

// Hàm đăng ký
export const register = async (userData) => {
    try {
        const response = await axiosInstance.post('/register', {
            username: userData.username,
            password: userData.password,
            confirmPassword: userData.confirmPassword,
            email: userData.email,
            phone: userData.phone,
            name: userData.name,
        });

        return {
            success: true,
            message: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response.data || 'Registration failed. Please try again.',
        };
    }
};

// Hàm đăng xuất
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('imageUrl');
};

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Lấy thông tin user hiện tại
export const getCurrentUser = () => {
    return {
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username'),
        name: localStorage.getItem('name'),
        imageUrl: localStorage.getItem('imageUrl'),
    };
};

export default axiosInstance;
