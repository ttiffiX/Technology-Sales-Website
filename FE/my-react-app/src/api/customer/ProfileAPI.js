import apiClient from '../apiClient';
import { getApiErrorMessage, mapApiFieldErrors } from '../../utils';

// Lấy thông tin profile của user hiện tại
export const getProfile = async () => {
    try {
        const response = await apiClient.get('/profile');
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: getApiErrorMessage(error, 'Failed to get profile'),
        };
    }
};

// Cập nhật thông tin profile
export const updateProfile = async (profileData) => {
    try {
        const response = await apiClient.put('/profile', profileData);
        return {
            success: true,
            data: response.data,
            message: 'Profile updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: getApiErrorMessage(error, 'Failed to update profile'),
            errors: mapApiFieldErrors(error, 'Failed to update profile'),
        };
    }
};

