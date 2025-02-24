import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const PatientProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching profile');
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Patient Profile</h2>
                <div className="profile-info">
                    <p><strong>Name:</strong> {profile?.name}</p>
                    <p><strong>Email:</strong> {profile?.email}</p>
                </div>
            </div>

            <div className="appointments-section">
                <h3>My Appointments</h3>
                {appointments.length > 0 ? (
                    <div className="appointments-list">
                        {appointments.map(apt => (
                            <div key={apt._id} className="appointment-card">
                                <p><strong>Doctor:</strong> {apt.doctor.name}</p>
                                <p><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {apt.status}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No appointments scheduled</p>
                )}
            </div>
        </div>
    );
};

export default PatientProfile;