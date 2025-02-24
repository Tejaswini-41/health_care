import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import BookAppointment from './components/Appointment/BookAppointment';
import PatientProfile from './components/Profile/PatientProfile';
import DoctorProfile from './components/Profile/DoctorProfile';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/patient-profile" element={<PatientProfile />} />
                <Route path="/doctor-profile" element={<DoctorProfile />} />
            </Routes>
        </Router>
    );
};

export default App;