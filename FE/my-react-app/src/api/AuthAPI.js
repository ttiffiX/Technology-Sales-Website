import apiClient from './apiClient';

// Hàm đăng nhập
export const login = async (username, password) => {
    try {
        const response = await apiClient.post('/auth/login', {
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
            message: error.response?.data.message || 'Login failed. Please check your credentials.',
        };
    }
};

// Hàm đăng ký
export const register = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', {
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
            message: error.response?.data || 'Registration failed. Please try again.',
        };
    }
};

// Hàm xác minh email
export const verifyEmail = async (token) => {
    try {
        const response = await apiClient.get('/auth/verify-email', {
            params: { token }
        });

        return {
            success: true,
            message: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data.message || 'Email verification failed. Token may be invalid or expired.',
            status: error.response?.status,
        };
    }
};

// Hàm gửi lại email xác thực
export const resendVerificationEmail = async (email) => {
    try {
        const response = await apiClient.post('/auth/resend-verification', null, {
            params: { email }
        });

        return {
            success: true,
            message: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data.message || 'Failed to resend verification email. Please try again.',
            status: error.response?.status,
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

// Hàm đổi mật khẩu
export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
        const response = await apiClient.patch('/auth/change-password', {
            oldPassword,
            newPassword,
            confirmPassword,
        });

        return {
            success: true,
            message: response.data || 'Password changed successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to change password. Please try again.',
        };
    }
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

