import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="profile-section">
                <div className="profile-image">
                    <img src="/default-avatar.png" alt="Profile" />
                </div>
                <h3>{user?.name}</h3>
                <p>{user?.role}</p>
            </div>
            
            <nav className="sidebar-nav">
                <Link to="/dashboard" className="nav-link">
                    <i className="fas fa-home"></i> Dashboard
                </Link>
                
                {user?.role === 'Patient' ? (
                    <>
                        <Link to="/book-appointment" className="nav-link">
                            <i className="fas fa-calendar-plus"></i> Book Appointment
                        </Link>
                        <Link to="/my-appointments" className="nav-link">
                            <i className="fas fa-calendar-check"></i> My Appointments
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/my-schedule" className="nav-link">
                            <i className="fas fa-clock"></i> My Schedule
                        </Link>
                        <Link to="/patient-list" className="nav-link">
                            <i className="fas fa-users"></i> Patients
                        </Link>
                    </>
                )}
                
                <Link to="/profile" className="nav-link">
                    <i className="fas fa-user"></i> Profile
                </Link>
                
                <button onClick={handleLogout} className="logout-btn">
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;