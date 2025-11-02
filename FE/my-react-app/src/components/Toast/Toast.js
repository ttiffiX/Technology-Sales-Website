import React, {createContext, useContext, useState} from 'react';
import {toast} from 'react-toastify';

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
