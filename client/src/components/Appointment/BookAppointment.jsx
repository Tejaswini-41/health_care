import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookAppointment.css';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        symptoms: '',
        age: '',
        bmi: '',
        heart_rate: [],
        activity_levels: [],
        medical_history: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/appointments/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data.doctors);
        } catch (error) {
            setError('Error fetching doctors');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/appointments/create',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSuccess('Appointment booked successfully!');
                setTimeout(() => {
                    navigate('/patient-dashboard');
                }, 1000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error booking appointment');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    return (
        <div className="book-appointment-container">
            <h2>Book an Appointment</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit} className="appointment-form">
                <div className="form-grid">
                    <div className="form-section basic-info">
                        <h3>Basic Information</h3>
                        <div className="grid-row">
                            <div className="grid-item">
                                <label>Select Doctor</label>
                                <select name="doctorId" value={formData.doctorId} onChange={handleInputChange} required>
                                    <option value="">Choose a doctor</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor._id} value={doctor._id}>
                                            Dr. {doctor.name} - {doctor.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid-item">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="grid-item">
                                <label>Time</label>
                                <select name="time" value={formData.time} onChange={handleInputChange} required>
                                    <option value="">Select time</option>
                                    <option value="09:00">09:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="14:00">02:00 PM</option>
                                    <option value="15:00">03:00 PM</option>
                                    <option value="16:00">04:00 PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section health-metrics">
                        <h3>Health Metrics</h3>
                        <div className="grid-row">
                            <div className="grid-item">
                                <label>Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="120"
                                />
                            </div>
                            <div className="grid-item">
                                <label>BMI</label>
                                <input
                                    type="number"
                                    name="bmi"
                                    value={formData.bmi}
                                    onChange={handleInputChange}
                                    step="0.1"
                                    min="10"
                                    max="50"
                                />
                            </div>
                            <div className="grid-item">
                                <label>Last Heart Rate</label>
                                <input
                                    type="number"
                                    name="heart_rate"
                                    value={formData.heart_rate}
                                    onChange={handleInputChange}
                                    placeholder="BPM"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section medical-info">
                        <h3>Medical Information</h3>
                        <div className="grid-row">
                            <div className="grid-item full-width">
                                <label>Symptoms</label>
                                <textarea
                                    name="symptoms"
                                    value={formData.symptoms}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Please describe your symptoms"
                                    rows="4"
                                />
                            </div>
                            <div className="grid-item full-width">
                                <label>Medical History</label>
                                <textarea
                                    name="medical_history"
                                    value={formData.medical_history}
                                    onChange={handleInputChange}
                                    placeholder="Any relevant medical history"
                                    rows="4"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookAppointment;