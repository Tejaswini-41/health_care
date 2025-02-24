import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const DoctorDashboard = () => {
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchDoctorData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching doctor data:', error);
            }
        };

        fetchDoctorData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleAppointmentStatus = async (appointmentId, status) => {
        try {
            await axios.put(`http://localhost:5000/appointments/${appointmentId}`, 
                { status },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
            );
            // Refresh appointments after status update
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment status:', error);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h2>Doctor Dashboard</h2>
                <button onClick={handleLogout}>Logout</button>
            </nav>
            
            <div className="dashboard-content">
                {user && (
                    <div className="user-info">
                        <h3>Welcome, Dr. {user.name}</h3>
                        <p>Email: {user.email}</p>
                    </div>
                )}

                <div className="dashboard-sections">
                    <section className="appointments-section">
                        <h3>Today's Appointments</h3>
                        {appointments.length > 0 ? (
                            <ul className="appointments-list">
                                {appointments.map((appointment) => (
                                    <li key={appointment._id} className="appointment-item">
                                        <p>Patient: {appointment.patientName}</p>
                                        <p>Time: {appointment.time}</p>
                                        <p>Status: {appointment.status}</p>
                                        <div className="appointment-actions">
                                            <button 
                                                onClick={() => handleAppointmentStatus(appointment._id, 'accepted')}
                                                className="accept-btn"
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleAppointmentStatus(appointment._id, 'rejected')}
                                                className="reject-btn"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No appointments for today</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;