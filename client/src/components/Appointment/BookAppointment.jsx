import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookAppointment.css';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        symptoms: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/appointments/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data.data);
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
            setSuccess('Appointment booked successfully!');
            setFormData({
                doctorId: '',
                date: '',
                time: '',
                symptoms: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Error booking appointment');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="book-appointment-container">
            <h2>Book an Appointment</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit} className="appointment-form">
                <div className="form-group">
                    <label>Select Doctor</label>
                    <select
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Choose a doctor</option>
                        {doctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>
                                Dr. {doctor.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Time</label>
                    <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select time</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Symptoms</label>
                    <textarea
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleChange}
                        required
                        placeholder="Describe your symptoms"
                        rows="4"
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>
        </div>
    );
};

export default BookAppointment;