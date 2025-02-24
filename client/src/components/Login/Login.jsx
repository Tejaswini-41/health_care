import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        role: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/auth/login', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.user.role);

            // Redirect based on role
            if (response.data.user.role === 'Patient') {
                navigate('/patient-dashboard');
            } else {
                navigate('/doctor-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <p className="tagline">Healthcare Portal</p>
            <form onSubmit={handleSubmit} className="login-form">
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="role-select"
                    required
                >
                    <option value="">Select Role</option>
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                </select>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="input-field"
                />
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="input-field"
                />
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}
            <p>Don't have an account?</p>
            <Link to="/register" className="register-link">Register</Link>
        </div>
    );
};

export default Login;