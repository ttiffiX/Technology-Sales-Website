import apiClient from './apiClient';

// Lấy tất cả địa chỉ của user
export const getAllAddresses = async () => {
    try {
        const response = await apiClient.get('/address');
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to get addresses',
        };
    }
};

// Lấy địa chỉ theo ID
export const getAddressById = async (id) => {
    try {
        const response = await apiClient.get(`/address/${id}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to get address',
        };
    }
};

// Tạo địa chỉ mới
export const createAddress = async (addressData) => {
    try {
        const response = await apiClient.post('/address', addressData);
        return {
            success: true,
            data: response.data,
            message: 'Address created successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create address',
        };
    }
};

// Cập nhật địa chỉ
export const updateAddress = async (id, addressData) => {
    try {
        const response = await apiClient.put(`/address/${id}`, addressData);
        return {
            success: true,
            data: response.data,
            message: 'Address updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update address',
        };
    }
};

// Xóa địa chỉ
export const deleteAddress = async (id) => {
    try {
        const response = await apiClient.delete(`/address/${id}`);
        return {
            success: true,
            message: response.data || 'Address deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete address',
        };
    }
};

// Đặt địa chỉ làm mặc định
export const setDefaultAddress = async (id) => {
    try {
        const response = await apiClient.patch(`/address/${id}/set-default`);
        return {
            success: true,
            data: response.data,
            message: 'Default address updated successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to set default address',
        };
    }
};

