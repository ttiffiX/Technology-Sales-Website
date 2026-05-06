import { useState, useEffect } from "react";
import apiClient from "../apiClient";
import { getApiErrorMessage } from '../../utils';

const BASE_URL = '/orders';

/**
 * Get orders for current user (API call only)
 */
export const getOrders = async (params = {}) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response.data;
};

/**
 * Hook to get order details (products) for a specific order
 * @param {number} orderId
 */
export const useGetOrderDetails = (orderId) => {
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDetails = async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            const response = await apiClient.get(`${BASE_URL}/${orderId}`);
            setOrderDetails(response.data);
            setError(null);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to fetch order details'));
            // console.error('Error fetching order details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [orderId]);

    return { orderDetails, loading, error, refetch: fetchDetails };
};

/**
 * Hook to place a new order
 */
export const usePlaceOrder = () => {
    const [loading, setLoading] = useState(false);

    const placeOrder = async (orderData) => {
        setLoading(true);
        try {
            // Map FE data to BE PlaceOrderRequest format
            const request = {
                customerName: orderData.customerName,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address,
                province: orderData.province,
                description: orderData.description || "",
                paymentMethod: orderData.paymentMethod // "VNPAY" or "CASH"
            };

            const response = await apiClient.post(BASE_URL, request);

            // BE returns Object for both VNPAY and CASH
            // VNPAY: { paymentUrl: "...", txnRef: "...", orderId: ... }
            // CASH: "Order placed successfully for user: username" (string)

            if (typeof response.data === 'object' && response.data.paymentUrl) {
                // VNPay payment response
                return {
                    success: true,
                    paymentUrl: response.data.paymentUrl,
                    txnRef: response.data.txnRef,
                    orderId: response.data.orderId
                };
            } else {
                // CASH payment response (string message)
                return {
                    success: true,
                    message: typeof response.data === 'string' ? response.data : 'Order placed successfully'
                };
            }
        } catch (err) {
            const errorMessage = getApiErrorMessage(err, 'Failed to place order');
            // console.error('Error placing order:', err);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { placeOrder, loading };
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = () => {
    const [loading, setLoading] = useState(false);

    const cancelOrder = async (orderId) => {
        setLoading(true);
        try {
            const response = await apiClient.patch(`${BASE_URL}/${orderId}/cancel`);
            return { success: true, message: response.data };
        } catch (err) {
            const errorMessage = getApiErrorMessage(err, 'Failed to cancel order');
            // console.error('Error canceling order:', err);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { cancelOrder, loading };
};

export const getOrderCountByStatus = async () => {
    const response = await apiClient.get(`${BASE_URL}/status-count`);
    const data = response.data || {};

    return {
        orderStatusCountMap: data.orderStatusCountMap || {},
        totalStatusCount: data.totalStatusCount ?? 0,
    };
};
