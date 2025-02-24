import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SyncHealth.css';

const SyncHealth = () => {
    const [healthData, setHealthData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHealthData();
    }, []);

    const fetchHealthData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/appointments/health-data',
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setHealthData(response.data.appointments);
            }
            setLoading(false);
        } catch (error) {
            setError('Error fetching health data');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading health data...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="sync-health-container">
            <div className="sync-header">
                <h2>Health Data History</h2>
                <button onClick={fetchHealthData} className="refresh-btn">
                    <i className="fas fa-sync-alt"></i> Refresh Data
                </button>
            </div>

            <div className="health-data-grid">
                {healthData.length > 0 ? (
                    healthData.map((appointment) => (
                        <div key={appointment._id} className="health-card">
                            <div className="health-card-header">
                                <h3>Visit Date: {new Date(appointment.date).toLocaleDateString()}</h3>
                                <span className="doctor-info">Dr. {appointment.doctor.name}</span>
                            </div>
                            <div className="health-metrics">
                                <div className="metric-card">
                                    <i className="fas fa-user"></i>
                                    <h4>Age</h4>
                                    <p>{appointment.age || 'N/A'} years</p>
                                </div>
                                <div className="metric-card">
                                    <i className="fas fa-weight"></i>
                                    <h4>BMI</h4>
                                    <p>{appointment.bmi?.toFixed(1) || 'N/A'}</p>
                                </div>
                                <div className="metric-card">
                                    <i className="fas fa-heartbeat"></i>
                                    <h4>Heart Rate</h4>
                                    <p>{appointment.heart_rate?.[0] || 'N/A'} BPM</p>
                                </div>
                                {appointment.activity_levels?.length > 0 && (
                                    <>
                                        <div className="metric-card">
                                            <i className="fas fa-walking"></i>
                                            <h4>Steps</h4>
                                            <p>{appointment.activity_levels[0][0] || 'N/A'}</p>
                                        </div>
                                        <div className="metric-card">
                                            <i className="fas fa-clock"></i>
                                            <h4>Duration</h4>
                                            <p>{appointment.activity_levels[0][1] || 'N/A'} min</p>
                                        </div>
                                        <div className="metric-card">
                                            <i className="fas fa-fire"></i>
                                            <h4>Calories</h4>
                                            <p>{appointment.activity_levels[0][2] || 'N/A'} kcal</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            {appointment.medical_history && (
                                <div className="medical-history">
                                    <h4>Medical History</h4>
                                    <p>{appointment.medical_history}</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-data-message">
                        <p>No health data available yet. Please book an appointment to record your health data.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SyncHealth;