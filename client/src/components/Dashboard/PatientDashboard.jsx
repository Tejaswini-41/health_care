import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const PatientDashboard = () => {
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

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
                <button onClick={handleLogout}>Logout</button>
            </nav>
            
            <div className="dashboard-content">
                {user && (
                    <div className="user-info">
                        <h3>Welcome, {user.name}</h3>
                        <p>Email: {user.email}</p>
                    </div>
                )}

                <div className="dashboard-sections">
                    <section className="appointments-section">
                        <h3>My Appointments</h3>
                        {appointments.length > 0 ? (
                            <ul className="appointments-list">
                                {appointments.map((appointment) => (
                                    <li key={appointment._id} className="appointment-item">
                                        <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                                        <p>Time: {appointment.time}</p>
                                        <p>Doctor: {appointment.doctorName}</p>
                                        <p>Status: {appointment.status}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No appointments scheduled</p>
                        )}
                        <button className="book-appointment-btn">Book New Appointment</button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;