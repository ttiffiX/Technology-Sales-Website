import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter as Router, Routes} from 'react-router-dom';
import CustomerRoutes from "./CustomerRoutes";
import PMRoutes from "./PMRoutes";
import AdminRoutes from "./AdminRoutes";

function RouterPages() {
    return (
        <Router future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
        }}>
            <Routes>
                {CustomerRoutes()}
                {PMRoutes()}
                {AdminRoutes()}
            </Routes>
        </Router>
    );
}

export default RouterPages;
