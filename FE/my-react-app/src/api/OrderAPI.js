import { useState, useEffect } from "react";
import apiClient from "./apiClient";

const BASE_URL = '/orders';

/**
 * Hook to get all orders for current user
 * @param {string} status - Optional filter by status (PENDING, APPROVED, REJECTED, CANCELLED, SUCCESS)
 */
export const useGetOrders = (status = null) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const url = status ? `${BASE_URL}?status=${status}` : BASE_URL;
                const response = await apiClient.get(url);
                setOrders(response.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data.message || 'Failed to fetch orders');
                // console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [status]);

    return { orders, loading, error, refetch: () => setLoading(true) };
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
            setError(err.response?.data.message || 'Failed to fetch order details');
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
            return { success: true, message: response.data };
        } catch (err) {
            const errorMessage = err.response?.data.message || 'Failed to place order';
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
            const errorMessage = err.response?.data.message || 'Failed to cancel order';
            // console.error('Error canceling order:', err);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { cancelOrder, loading };
};

