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
        symptoms: ''
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
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error booking appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="book-appointment-container">
            <h2>Book an Appointment</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit} className="appointment-form">
                <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                    required
                >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                            Dr. {doctor.name} - {doctor.specialization}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                />

                <select
                    name="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                >
                    <option value="">Select Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                </select>

                <textarea
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    placeholder="Describe your symptoms"
                    required
                    rows="4"
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>
        </div>
    );
};

export default BookAppointment;