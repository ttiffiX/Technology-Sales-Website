import apiClient, { setAccessToken, clearAccessToken } from './apiClient';

// Hàm đăng nhập
export const login = async (usernameOrEmail, password) => {
    try {
        const response = await apiClient.post('/auth/login', {
            usernameOrEmail,
            password,
        });

        if (response.data.token) {
            // Access token → lưu vào memory (an toàn, JS khác không đọc được)
            setAccessToken(response.data.token);
            // Refresh token → BE đã set HttpOnly Cookie, FE không cần xử lý

            // Thông tin user (không nhạy cảm) → lưu localStorage để hiển thị UI
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('imageUrl', response.data.imageUrl || '');
            localStorage.setItem('role', response.data.role || '');
        }

        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Login failed. Please check your credentials.',
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

// Hàm xác minh email bằng OTP
export const verifyEmail = async (email, otp) => {
    try {
        const response = await apiClient.post('/auth/verify-email', { email, otp });
        return {
            success: true,
            message: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'OTP verification failed. Please check and try again.',
            status: error.response?.status,
        };
    }
};

// Hàm gửi lại email xác thực
export const resendVerificationEmail = async (email) => {
    try {
        const response = await apiClient.post('/auth/resend-verification', null, {
            params: {email}
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
export const logout = async () => {
    try {
        // BE sẽ revoke refresh token trong DB và xóa HttpOnly Cookie
        await apiClient.post('/auth/logout');
    } catch (_) {
        // Ignore error, vẫn clear local state
    } finally {
        clearAccessToken();
        localStorage.removeItem('username');
        localStorage.removeItem('name');
        localStorage.removeItem('imageUrl');
        localStorage.removeItem('role');
    }
};

// Hàm quên mật khẩu
export const forgotPassword = async (email) => {
    try {
        const response = await apiClient.post('/auth/forgot-password', null, {
            params: {email}
        });

        return {
            success: true,
            message: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to reset password. Please try again.',
            status: error.response?.status,
        };
    }
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

// Kiểm tra xem user đã đăng nhập chưa (dựa vào localStorage vì token ở memory)
export const isAuthenticated = () => {
    return !!localStorage.getItem('username');
};

// Lấy thông tin user hiện tại
export const getCurrentUser = () => {
    return {
        username: localStorage.getItem('username'),
        name: localStorage.getItem('name'),
        imageUrl: localStorage.getItem('imageUrl'),
        role: localStorage.getItem('role'),
    };
};
