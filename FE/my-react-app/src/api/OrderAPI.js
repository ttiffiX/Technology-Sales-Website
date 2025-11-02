import {useEffect, useState} from "react";
import axios from "axios";

const BASE_URL = 'http://localhost:8080/orders';

export const getOrders = () => {
    const [orders, setOrders] = useState([]);  // Lưu trữ danh sách sản phẩm trong giỏ
    const [loading, setLoading] = useState(true);  // Trạng thái loading
    const [error, setError] = useState(null);  // Trạng thái lỗi
    const [orderDetails, setOrderDetails] = useState(0);  // Tổng số lượng hàng hóa

    useEffect(() => {
        const useOrders = async () => {
            try {
                const {orders, orderDetails} = await fetchOrders();
                setOrders(orders);
                setOrderDetails(orderDetails);
            } catch (err) {
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        useOrders();
    }, []);

    return {orders, orderDetails, loading, error};
};

export const fetchOrders = async () => {
    const response = await axios.get(`${BASE_URL}`)
    return response.data;
}

export const PlaceOrder = () => {
    const [loading, setLoading] = useState(false);

    const getInfoOrders = async (name, phone, address, paymentMethod) => {
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/add`, {
                name, phone, address, paymentMethod
            });
            return response.data;
        } catch (err) {
            throw err.response.data;
        } finally {
            setLoading(false); // Reset trạng thái loading
        }
    };
    return {getInfoOrders, loading};
}

export const useCancelOrder = () => {
    const cancelOrder = async (orderId) => {
        try {
            const response = await axios.put(`${BASE_URL}/cancel`, {
                orderId
            });
            return response.data;
        } catch (err) {
            throw err.response.data;
        }
    }
    return {cancelOrder};
}