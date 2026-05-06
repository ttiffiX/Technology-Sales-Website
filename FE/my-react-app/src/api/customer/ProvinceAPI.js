import apiClient from '../apiClient';
import { getApiErrorMessage } from '../../utils';

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
            message: getApiErrorMessage(error, 'Failed to get provinces'),
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
            message: getApiErrorMessage(error, 'Failed to get wards'),
        };
    }
};

