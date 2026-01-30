import React, {useEffect, useState} from "react";
import Nav from "../../components/navigation/Nav";
import './Login.scss'
import {Link, useNavigate} from "react-router-dom";
import {useCart} from "../../contexts/CartContext";
import {login, isAuthenticated} from "../../api/AuthAPI";
import {useToast} from "../../components/Toast/Toast";

function Login() {
    const {cartCount} = useCart();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const {triggerToast} = useToast();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                // Đăng nhập thành công
                // alert('Login Successful!');
                // alert('Login Successful!');
                triggerToast('success', 'Login Successful!');
                navigate('/'); // Chuyển về trang chủ
            } else {
                // Đăng nhập thất bại
                setError(result.message);
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav count={cartCount}/>
            <div className="login_login-container">
                <form className="login_login-form" onSubmit={handleSubmit}>
                    <div className="login_form-header">
                        <h2 className="login_login-title">Welcome Back</h2>
                        <p className="login_subtitle">Sign in to your account</p>
                    </div>

                    {error && <div className="login_login-error">{error}</div>}

                    <div className="login_input-group">
                        <label htmlFor="username">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                            </svg>
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="login_input-group">
                        <label htmlFor="password">
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="login_login-button" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Logging in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="login_helper-links">
                        <Link to="/forgot-password" className="login_helper-link">Forgot Password?</Link>
                        <Link to="/verification-help" className="login_helper-link">Issues with verification?</Link>
                    </div>

                    <div className="login_register-link">
                        <p>Don't have an account? <Link to="/register" className="login_register-button">Sign up
                            here</Link></p>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Login