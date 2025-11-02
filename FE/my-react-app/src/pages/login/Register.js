import React, { useState } from "react";
import Nav from "../../components/navigation/Nav";
import './Register.scss';
import {getCartItems} from "../../api/CartAPI";

function Register() {
    const {totalQuantity} = getCartItems();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Giả lập xác thực đăng ký
        if (username && email && password) {
            alert('Registration Successful!');
            setError('');
        } else {
            setError('Please fill all fields correctly.');
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="register_input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="register_input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="register_register-button">
                        Register
                    </button>
                </form>
            </div>
        </>
    );
}

export default Register;
