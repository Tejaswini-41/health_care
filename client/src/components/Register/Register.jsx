import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        specialization: '',
        experience: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const specializations = [
        'Cardiologist',
        'Dermatologist',
        'Pediatrician',
        'Neurologist',
        'Orthopedic',
        'General Physician'
    ];

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
            <h2>Create Account</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="register-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field"
                />

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="role-select"
                >
                    <option value="">Select Role</option>
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                </select>

                {formData.role === 'Doctor' && (
                    <>
                        <select
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select Specialization</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            name="experience"
                            placeholder="Years of Experience"
                            value={formData.experience}
                            onChange={handleChange}
                            required
                            min="0"
                            className="input-field"
                        />
                    </>
                )}

                <button type="submit" className="register-button" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <p>Already have an account?</p>
            <Link to="/login" className="login-link">Login</Link>
        </div>
    );
};

export default Register;