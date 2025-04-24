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
    const [loadingInsights, setLoadingInsights] = useState({});
    const [aiInsights, setAIInsights] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [smartwatchData, setSmartwatchData] = useState(null);
    const [showWatchModal, setShowWatchModal] = useState(false);
    const [loadingWatch, setLoadingWatch] = useState({});
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
        setLoadingInsights(prev => ({
            ...prev,
            [appointment._id]: true
        }));

        try {
            const healthData = {
                age: appointment.age || 0,
                bmi: appointment.bmi || 0,
                heart_rate: appointment.heart_rate || [70], // Default if no data
                activity_levels: appointment.activity_levels || [],
                medical_history: appointment.medical_history || '',
                medical_symptoms: appointment.symptoms || '',
                patient_id: appointment.patient._id // Add patient ID for tracking
            };

            const response = await axios.post(
                'http://localhost:8000/generate-summary',
                healthData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            setAIInsights({
                text: response.data.text,
                healthScore: response.data.health_score
            });
            setShowAIModal(true);
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            setError(
                error.code === 'ECONNREFUSED' 
                    ? 'Cannot connect to AI service. Please ensure the server is running.'
                    : 'Failed to get AI insights. Please try again.'
            );
        } finally {
            setLoadingInsights(prev => ({
                ...prev,
                [appointment._id]: false
            }));
        }
    };

    const dummyData = {
        activity: [7000, 8000],
        heartRate: [72, 75],
        oxygen: [97, 98],
        sleep: ['7 hrs', '6.5 hrs'],
        body: { weight: [68], height: [170] }
    };

    const extractValidValues = (data, fallback, count = 2) => {
        if (!data || !Array.isArray(data)) return fallback;
        const filtered = data
            .map((item) => (typeof item === 'object' ? item.value : item))
            .filter((val) => val !== 'No Data' && val !== null && val !== undefined);
        return filtered.length ? filtered.slice(-count) : fallback;
    };

    const handleViewSmartwatchData = async (patientId) => {
        // Set loading state for specific patient
        setLoadingWatch(prev => ({
            ...prev,
            [patientId]: true
        }));
        
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [stepsRes, heartRes, oxygenRes, sleepRes, bodyRes] = await Promise.all([
                axios.get(`http://localhost:5000/googlefit/steps/${patientId}`, config),
                axios.get(`http://localhost:5000/googlefit/heartRate/${patientId}`, config),
                axios.get(`http://localhost:5000/googlefit/oxygen/${patientId}`, config),
                axios.get(`http://localhost:5000/googlefit/sleep/${patientId}`, config),
                axios.get(`http://localhost:5000/googlefit/body/${patientId}`, config)
            ]);

            const activity = extractValidValues(stepsRes.data.steps, dummyData.activity);
            const heartRate = extractValidValues(heartRes.data.heartRate, dummyData.heartRate);
            const oxygen = extractValidValues(oxygenRes.data.oxygen, dummyData.oxygen);
            const sleep = extractValidValues(sleepRes.data.sleep, dummyData.sleep);
            const weight = extractValidValues(bodyRes.data.body.weight, dummyData.body.weight, 1);
            const height = extractValidValues(bodyRes.data.body.height, dummyData.body.height, 1);

            setSmartwatchData({
                activity,
                heartRate,
                oxygen,
                sleep,
                body: { weight, height }
            });

            setShowWatchModal(true);
        } catch (err) {
            console.error('Smartwatch fetch failed', err);
            alert('Smartwatch data unavailable for this patient.');
        } finally {
            // Clear loading state for specific patient
            setLoadingWatch(prev => ({
                ...prev,
                [patientId]: false
            }));
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
                                        className={`ai-insights-btn ${loadingInsights[appointment._id] ? 'loading' : ''}`}
                                        onClick={() => handleGetAIInsights(appointment)}
                                        disabled={loadingInsights[appointment._id]}
                                    >
                                        {loadingInsights[appointment._id] ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-robot"></i>
                                                AI Insights
                                            </>
                                        )}
                                    </button>
                                    <button 
                                            className="smartwatch-btn"
                                            onClick={() => handleViewSmartwatchData(appointment.patient._id)}
                                        >
                                            {loadingWatch[appointment.patient._id] ? "Loading..." : "Smartwatch Data"}
                                        </button>   
                                    {appointment.medicalReportUrl && (
                                        <button
                                            className="view-report-btn"
                                            onClick={() => window.open(appointment.medicalReportUrl, "_blank")}
                                        >
                                            📄 View Medical Report
                                        </button>
                                    )}
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
                                        <div className="medical-history-text">
                                            {selectedAppointment.medical_history.split('\n').map((line, index) => (
                                                <p key={index}>{line.trim() ? line : <br />}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showAIModal && aiInsights && (
                    <div className="modal">
                        <div className="modal-content ai-insights">
                            <div className="modal-header">
                                <h3>AI Health Analysis</h3>
                                <div className="health-score">
                                    Health Score: {aiInsights.healthScore}
                                    <div className="score-indicator" 
                                         style={{
                                             '--score': `${aiInsights.healthScore}%`,
                                             backgroundColor: `hsl(${aiInsights.healthScore * 1.2}, 70%, 45%)`
                                         }}>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setShowAIModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="ai-report">
                                    {aiInsights.text.split('\n').map((line, index) => (
                                        <p key={index}>{line.trim() ? line : <br/>}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {showWatchModal && smartwatchData && (
                    <div className="modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Smartwatch Data</h3>
                                <button className="close-btn" onClick={() => setShowWatchModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="health-metrics-grid">
                                    <div className="metric-item"><h4>Steps</h4><p>{smartwatchData.activity.join(', ')} steps</p></div>
                                    <div className="metric-item"><h4>Heart Rate</h4><p>{smartwatchData.heartRate.join(', ')} bpm</p></div>
                                    <div className="metric-item"><h4>Oxygen</h4><p>{smartwatchData.oxygen.join(', ')}%</p></div>
                                    <div className="metric-item"><h4>Sleep</h4><p>{smartwatchData.sleep.join(', ')}</p></div>
                                    <div className="metric-item"><h4>Weight</h4><p>{smartwatchData.body.weight[0]} kg</p></div>
                                    <div className="metric-item"><h4>Height</h4><p>{smartwatchData.body.height[0]} m</p></div>
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


