import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h2>Patient Dashboard</h2>
                <div className="nav-buttons">
                    <button onClick={() => navigate('/book-appointment')} className="book-btn">
                        Book New Appointment
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <section className="appointments-section">
                    <h3>My Appointments</h3>
                    {appointments.length > 0 ? (
                        <div className="appointments-grid">
                            {appointments.map((apt) => (
                                <div key={apt._id} className="appointment-card">
                                    <h4>Appointment with Dr. {apt.doctor.name}</h4>
                                    <p>Date: {new Date(apt.date).toLocaleDateString()}</p>
                                    <p>Time: {apt.time}</p>
                                    <p>Status: <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span></p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-appointments">No appointments scheduled</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PatientDashboard;