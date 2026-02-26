import React, { useState } from 'react';
import { register } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const formatApiError = (err) => {
    const data = err?.response?.data;
    if (!data) return 'Registration failed. Please try again.';
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
        const parts = [];
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) parts.push(`${key}: ${value.join(' ')}`);
            else if (typeof value === 'string') parts.push(`${key}: ${value}`);
            else parts.push(`${key}: ${JSON.stringify(value)}`);
        }
        return parts.length ? parts.join(' | ') : 'Registration failed. Please try again.';
    }
    return 'Registration failed. Please try again.';
};

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/login');
        } catch (err) {
            setError(formatApiError(err));
        }
    };

    return (
        <div className="login-page">
            <h1>Create Account</h1>
            {error && <div className="error">{error}</div>}
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="login-btn" type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
