import React, { useEffect, useState } from "react";
import Nav from "../../components/navigation/Nav";
import './Register.scss';
import {useGetCartItems} from "../../api/CartAPI";
import {register, isAuthenticated} from "../../api/AuthAPI";
import {useNavigate} from "react-router-dom";
import {useToast} from "../../components/Toast/Toast";

function Register() {
    const {totalQuantity} = useGetCartItems();
    const navigate = useNavigate();
    const {triggerToast} = useToast();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra password và confirmPassword có khớp không
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        setLoading(true);

        try {
            const result = await register(formData);

            if (result.success) {
                // Đăng ký thành công
                // alert('Registration Successful! Please login.');
                triggerToast('success', 'Registration Successful! Please login.');
                navigate('/login'); // Chuyển về trang login
            } else {
                // Đăng ký thất bại
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
            <Nav count={totalQuantity} />
            <div className="register_register-container">
                <form className="register_register-form" onSubmit={handleSubmit}>
                    <h2 className="register_register-title">Register</h2>

                    {error && <div className="register_register-error">{error}</div>}

                    <div className="register_input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="register_input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="register_input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="register_input-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>

                    <div className="register_input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="register_input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button type="submit" className="register_register-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </>
    );
}

export default Register;
