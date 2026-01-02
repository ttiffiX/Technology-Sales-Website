import React, {useEffect, useState} from "react";
import Nav from "../../components/navigation/Nav";
import './Register.scss';
import {useGetCartItems} from "../../api/CartAPI";
import {register, isAuthenticated} from "../../api/AuthAPI";
import {useNavigate} from "react-router-dom";
import {useToast} from "../../components/Toast/Toast";
import {isValidEmail, isValidPhone, isValidPassword, passwordsMatch} from "../../utils";

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
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        } else if (!isValidPhone(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!isValidPassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (!passwordsMatch(formData.password, formData.confirmPassword)) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await register(formData);

            if (result.success) {
                triggerToast('success', 'Registration Successful! Please check your email to verify your account.');
                // Navigate to waiting verification page with email
                navigate('/waiting-verification', {
                    state: { email: formData.email }
                });
            } else {
                setErrors({general: result.message.message});
                if (result.message.errors) {
                    setErrors(prev => ({
                        ...prev,
                        ...result.message.errors
                    }));
                }

            }
        } catch (err) {
            setErrors({general: 'An error occurred. Please try again.'});
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav count={totalQuantity}/>
            <div className="register_register-container">
                <form className="register_register-form" onSubmit={handleSubmit}>
                    <h2 className="register_register-title">Register</h2>

                    {errors.general && <div className="register_register-error">{errors.general}</div>}

                    <div className="register_input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            className={errors.username ? 'error' : ''}
                        />
                        {errors.username && <span className="error-text">{errors.username}</span>}
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
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
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
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
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
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
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
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
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
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
