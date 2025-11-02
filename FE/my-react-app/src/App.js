import React from 'react';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';
import RouterPages from "./router/RouterPages";
import {ToastProvider} from "./components/Toast/Toast";
import {ToastContainer} from "react-toastify";

function App() {
    return (
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

    );
}

export default App;
