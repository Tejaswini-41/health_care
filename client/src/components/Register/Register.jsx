import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        role: '',
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            const response = await axios.post('http://localhost:5000/auth/register', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.user.role);

            // Redirect based on role
            if (response.data.user.role === 'Patient') {
                navigate('/patient-dashboard');
            } else {
                navigate('/doctor-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <p className="tagline">Join our Healthcare Portal</p>
            
            <form onSubmit={handleSubmit} className="register-form">
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
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="input-field"
                />
                
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

                <button type="submit" className="register-button" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}
            
            <p>Already have an account?</p>
            <Link to="/login" className="login-link">Login</Link>
        </div>
    );
};

export default Register;