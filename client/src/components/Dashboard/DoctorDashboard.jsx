import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctorData();
        fetchAppointments();
    }, []);

    const fetchDoctorData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data.user);
        } catch (error) {
            setError('Error fetching profile');
        }
    };

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/appointments/doctor-appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data.appointments);
        } catch (error) {
            setError('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/appointments/update-status/${appointmentId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            // Refresh appointments after status update
            fetchAppointments();
        } catch (error) {
            setError('Failed to update appointment status');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard-layout">
            <div className="sidebar">
                <div className="profile-section">
                    <div className="profile-image">
                        <img src="https://via.placeholder.com/150" alt="Doctor Profile" />
                    </div>
                    <div className="profile-details">
                        <h3>Dr. {profile?.name}</h3>
                        <p className="specialization">{profile?.specialization}</p>
                        <p className="experience">{profile?.experience} Years Experience</p>
                        <p className="email">{profile?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>

            <div className="main-content">
                <h2>Appointments</h2>
                {error && <div className="error-message">{error}</div>}
                
                <div className="appointments-grid">
                    {appointments.map(appointment => (
                        <div key={appointment._id} className={`appointment-card ${appointment.status.toLowerCase()}`}>
                            <h4>Patient Details</h4>
                            <p><strong>Name:</strong> {appointment.patient.name}</p>
                            <p><strong>Email:</strong> {appointment.patient.email}</p>
                            <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {appointment.time}</p>
                            <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                            <div className="status-section">
                                <p><strong>Current Status:</strong> {appointment.status}</p>
                                {appointment.status === 'Pending' && (
                                    <div className="status-actions">
                                        <button 
                                            className="approve-btn"
                                            onClick={() => handleStatusUpdate(appointment._id, 'Approved')}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="reject-btn"
                                            onClick={() => handleStatusUpdate(appointment._id, 'Rejected')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;