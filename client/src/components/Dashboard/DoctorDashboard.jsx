import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/appointments/update-status/${appointmentId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchAppointments();
        } catch (error) {
            setError('Error updating appointment status');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="doctor-dashboard">
            <div className="profile-card">
                <div className="profile-header">
                    <h2>Doctor Profile</h2>
                </div>
                <div className="profile-info">
                    <p><strong>Name:</strong> Dr. {profile?.name}</p>
                    <p><strong>Email:</strong> {profile?.email}</p>
                    <p><strong>Specialization:</strong> {profile?.specialization}</p>
                    <p><strong>Experience:</strong> {profile?.experience} years</p>
                </div>
            </div>

            <div className="appointments-section">
                <h3>Upcoming Appointments</h3>
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
                            <p><strong>Status:</strong> {appointment.status}</p>
                            
                            {appointment.status === 'Pending' && (
                                <div className="action-buttons">
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;