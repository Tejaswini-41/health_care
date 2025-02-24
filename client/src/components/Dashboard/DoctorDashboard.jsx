import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiInsights, setAIInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
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

    const handleViewDetails = (appointmentId) => {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleGetAIInsights = async (appointment) => {
        setLoadingInsights(true);
        try {
            const data = {
                age: appointment.age,
                bmi: appointment.bmi,
                heart_rate: appointment.heart_rate || [],
                activity_levels: appointment.activity_levels || [],
                medical_history: appointment.medical_history || '',
                medical_symptoms: appointment.symptoms
            };

            const response = await axios.post('http://localhost:8000/generate-summary', data);
            setAIInsights(response.data);
            setShowAIModal(true);
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            setError('Failed to fetch AI insights');
        } finally {
            setLoadingInsights(false);
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
                                <p><strong>Current Status:</strong> 
                                    <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                                        {appointment.status}
                                    </span>
                                </p>
                                <div className="action-buttons">
                                    {appointment.status === 'Pending' && (
                                        <>
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
                                        </>
                                    )}
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => handleViewDetails(appointment._id)}
                                    >
                                        View Health Data
                                    </button>
                                    <button 
                                        className="ai-insights-btn"
                                        onClick={() => handleGetAIInsights(appointment)}
                                        disabled={loadingInsights}
                                    >
                                        {loadingInsights ? 'Loading...' : 'AI Insights'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && selectedAppointment && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Patient Health Data</h3>
                                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="health-metrics-grid">
                                    <div className="metric-item">
                                        <i className="fas fa-user"></i>
                                        <h4>Age</h4>
                                        <p>{selectedAppointment.age || 'N/A'} years</p>
                                    </div>
                                    <div className="metric-item">
                                        <i className="fas fa-weight"></i>
                                        <h4>BMI</h4>
                                        <p>{selectedAppointment.bmi?.toFixed(1) || 'N/A'}</p>
                                    </div>
                                    <div className="metric-item">
                                        <i className="fas fa-heartbeat"></i>
                                        <h4>Heart Rate</h4>
                                        <p>{selectedAppointment.heart_rate?.[0] || 'N/A'} BPM</p>
                                    </div>
                                    {selectedAppointment.activity_levels?.length > 0 && (
                                        <>
                                            <div className="metric-item">
                                                <i className="fas fa-walking"></i>
                                                <h4>Steps</h4>
                                                <p>{selectedAppointment.activity_levels[0][0] || 'N/A'}</p>
                                            </div>
                                            <div className="metric-item">
                                                <i className="fas fa-clock"></i>
                                                <h4>Duration</h4>
                                                <p>{selectedAppointment.activity_levels[0][1] || 'N/A'} min</p>
                                            </div>
                                            <div className="metric-item">
                                                <i className="fas fa-fire"></i>
                                                <h4>Calories</h4>
                                                <p>{selectedAppointment.activity_levels[0][2] || 'N/A'} kcal</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {selectedAppointment.medical_history && (
                                    <div className="medical-history">
                                        <h4>Medical History</h4>
                                        <p>{selectedAppointment.medical_history}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showAIModal && aiInsights && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>AI Health Insights</h3>
                                <button className="close-btn" onClick={() => setShowAIModal(false)}>×</button>
                            </div>
                            <div className="modal-body ai-insights">
                                <div className="ai-content">
                                    {aiInsights.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;