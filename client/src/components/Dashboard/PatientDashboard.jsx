import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import Layout from '../Layout/Layout';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (error) {
                setError('Error fetching profile: ' + error.message);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/appointments/notifications',
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <Layout user={user}>
            <div className="dashboard-container">
                <div className="profile-section">
                    <h2>Welcome, {user?.name}</h2>
                    <p className="user-email">Email: {user?.email}</p>
                    <p className="user-role">Role: {user?.role}</p>
                </div>
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

                <div className="sidebar">
                    <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                        <i className="fas fa-bell"></i>
                        {notifications.length > 0 && (
                            <span className="notification-badge">{notifications.length}</span>
                        )}
                    </div>
                </div>

                <div className="main-content">
                    {showNotifications && notifications.length > 0 && (
                        <div className="notifications-panel">
                            <h3>Notifications</h3>
                            {notifications.map((notification, index) => (
                                <div key={index} className="notification-item">
                                    <p>{notification.message}</p>
                                    <span className="notification-time">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PatientDashboard;