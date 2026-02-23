import apiClient from './apiClient';

// Lấy tất cả tỉnh/thành phố
export const getAllProvinces = async () => {
    try {
        const response = await apiClient.get('/province');
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to get provinces',
        };
    }
};

// Lấy danh sách phường/xã theo mã tỉnh
export const getWardsByProvinceCode = async (provinceCode) => {
    try {
        const response = await apiClient.get(`/province/${provinceCode}/wards`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to get wards',
        };
    }
};

