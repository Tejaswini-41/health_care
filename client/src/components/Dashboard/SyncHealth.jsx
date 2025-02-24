import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SyncHealth.css';

const SyncHealth = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/appointments/my-appointments',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Sort appointments by date in descending order
                const sortedAppointments = response.data.appointments.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setAppointments(sortedAppointments);
            }
            setLoading(false);
        } catch (error) {
            setError('Error fetching appointment data');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading health data...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="sync-health-container">
            <div className="sync-header">
                <h2>Health Records History</h2>
                <button onClick={fetchAppointments} className="refresh-btn">
                    <i className="fas fa-sync-alt"></i> Refresh Data
                </button>
            </div>

            <div className="appointments-timeline">
                {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                        <div key={appointment._id} className="health-record-card">
                            <div className="record-header">
                                <div className="header-main">
                                    <h3>
                                        <i className="fas fa-calendar-alt"></i>
                                        {new Date(appointment.date).toLocaleDateString()}
                                    </h3>
                                    <span className="appointment-time">
                                        <i className="fas fa-clock"></i>
                                        {appointment.time}
                                    </span>
                                </div>
                                <div className="doctor-info">
                                    <i className="fas fa-user-md"></i>
                                    Dr. {appointment.doctor.name} - {appointment.doctor.specialization}
                                </div>
                            </div>

                            <div className="health-metrics-grid">
                                <div className="metric-item">
                                    <i className="fas fa-user"></i>
                                    <span className="metric-label">Age</span>
                                    <span className="metric-value">{appointment.age || 'N/A'}</span>
                                </div>
                                <div className="metric-item">
                                    <i className="fas fa-weight"></i>
                                    <span className="metric-label">BMI</span>
                                    <span className="metric-value">
                                        {appointment.bmi ? appointment.bmi.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                                <div className="metric-item">
                                    <i className="fas fa-heartbeat"></i>
                                    <span className="metric-label">Heart Rate</span>
                                    <span className="metric-value">
                                        {appointment.heart_rate && appointment.heart_rate.length > 0
                                            ? `${appointment.heart_rate[0]} BPM`
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {appointment.medical_history && (
                                <div className="medical-history">
                                    <h4>
                                        <i className="fas fa-notes-medical"></i>
                                        Medical History
                                    </h4>
                                    <p>{appointment.medical_history}</p>
                                </div>
                            )}

                            <div className="symptoms-section">
                                <h4>
                                    <i className="fas fa-clipboard-list"></i>
                                    Symptoms
                                </h4>
                                <p>{appointment.symptoms}</p>
                            </div>

                            <div className="appointment-status">
                                <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                                    {appointment.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data-message">
                        <i className="fas fa-file-medical-alt"></i>
                        <p>No health records available. Book an appointment to start tracking your health data.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SyncHealth;