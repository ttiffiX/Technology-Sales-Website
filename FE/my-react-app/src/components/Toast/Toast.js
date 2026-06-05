import React, {createContext, useContext, useState} from 'react';
import {toast} from 'react-toastify';
import notification from "../../assets/icon/notification.png";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({children}) => {
    const [showToast, setShowToast] = useState(false);
    const [toastInfo, setToastInfo] = useState({status: '', message: ''});

    const showMessage = (status, message) => {
        if (status === "error") {
            toast.error(message);
        } else if (status === "success") {
            toast.success(message);
        } else if (status === "notification") {
            const NotificationContent = () => (
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <img
                            src={notification}
                            alt="Notification"
                            style={{
                                width: '22px',
                                height: '22px',
                                objectFit: 'contain',
                                flexShrink: 0,
                                animation: 'ring 2s ease infinite'
                            }}
                        />
                        <span style={{fontWeight: 700, color: '#f5a623', fontSize: '15px'}}>
                            New Notification
                </span>
                    </div>
                    <div style={{color: '#334155', fontSize: '14px', marginTop: '6px', lineHeight: '1.4'}}>
                        {message}
                    </div>
                </div>
            );

            // Sử dụng hàm toast() gốc (thay vì toast.info) để tự do custom
            toast(<NotificationContent/>, {
                position: "top-right",

                // 1. XỬ LÝ THỜI GIAN TỒN TẠI
                autoClose: false,      // Tắt tự động đóng, xếp stack chồng lên nhau cho đến khi tắt

                // 2. CẤU HÌNH GIAO DIỆN CHUNG
                hideProgressBar: true, // không tự đóng
                draggable: true,
                theme: "light",
                style: {
                    borderLeft: '5px solid #f5a623', // Vạch cam
                    borderRadius: '12px',
                    padding: '16px 12px',
                    background: '#ffffff',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Đổ bóng bồng bềnh
                    minWidth: '320px'
                }
            });
        } else {
            toast.info(message);
        }
        setShowToast(false);
    };

    React.useEffect(() => {
        if (showToast) {
            showMessage(toastInfo.status, toastInfo.message);
            setShowToast(false);
        }
    }, [showToast, toastInfo]);

    const triggerToast = (status, message) => {
        setToastInfo({status, message});
        setShowToast(true);
    };

    return (
        <ToastContext.Provider value={{triggerToast}}>
            {children}
        </ToastContext.Provider>
    );
};