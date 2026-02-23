import React, { useEffect, useState } from 'react';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';
import RouterPages from "./router/RouterPages";
import {ToastProvider} from "./components/Toast/Toast";
import {ToastContainer} from "react-toastify";
import {CartProvider} from "./contexts/CartContext";
import {CompareProvider} from "./contexts/CompareContext";
import axios from 'axios';
import {BASE_URL, setAccessToken} from './api/apiClient';

function App() {
    // null = đang kiểm tra, true/false = kết quả
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        // Khi F5: access token mất khỏi memory
        // Thử gọi silent refresh nếu HttpOnly Cookie còn hạn
        const silentRefresh = async () => {
            const username = localStorage.getItem('username');
            if (!username) {
                // Chưa đăng nhập → không cần refresh
                setAuthReady(true);
                return;
            }
            try {
                const res = await axios.post(
                    `${BASE_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                setAccessToken(res.data.accessToken);
            } catch (_) {
                // Cookie hết hạn hoặc bị revoke → xóa thông tin user
                localStorage.removeItem('username');
                localStorage.removeItem('name');
                localStorage.removeItem('imageUrl');
                localStorage.removeItem('role');
            } finally {
                setAuthReady(true);
            }
        };

        silentRefresh();
    }, []);

    // Chờ kiểm tra auth xong mới render app (tránh flash nội dung sai)
    if (!authReady) return null;

    return (
        <CartProvider>
            <CompareProvider>
                <ToastProvider>
                    <RouterPages/>
                    <ToastContainer
                        position="top-left"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </ToastProvider>
            </CompareProvider>
        </CartProvider>
    );
}

export default App;
