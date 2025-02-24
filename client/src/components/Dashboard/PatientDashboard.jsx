import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientDashboard.css";
import BookAppointment from "../Appointment/BookAppointment";
import SmartwatchConnect from "../Smartwatch/SmartwatchConnect.jsx";
import SyncHealth from "./SyncHealth";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [userRes, appointmentsRes, notificationsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/appointments/my-appointments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/appointments/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUser(userRes.data.user);
      setAppointments(appointmentsRes.data.appointments || []);
      setNotifications(notificationsRes.data.notifications || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/appointments/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return (
          <div className="appointments-container">
            <div className="appointments-header">
              <h3>My Appointments</h3>
              <button
                className="book-appointment-btn"
                onClick={() => setActiveTab("book")}
              >
                <i className="fas fa-plus"></i> New Appointment
              </button>
            </div>
            <div className="appointments-grid">
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className={`appointment-card ${apt.status.toLowerCase()}`}
                >
                  <div className="card-header">
                    <h4>Dr. {apt.doctor.name}</h4>
                    <span
                      className={`status-badge ${apt.status.toLowerCase()}`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>
                      <i className="fas fa-calendar"></i>{" "}
                      {new Date(apt.date).toLocaleDateString()}
                    </p>
                    <p>
                      <i className="fas fa-clock"></i> {apt.time}
                    </p>
                    <p>
                      <i className="fas fa-user-md"></i>{" "}
                      {apt.doctor.specialization}
                    </p>
                    <p className="symptoms">
                      <i className="fas fa-notes-medical"></i> {apt.symptoms}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "book":
        return (
          <BookAppointment onSuccess={() => setActiveTab("appointments")} />
        );
     case 'smartwatch':
        return <SmartwatchConnect />;
      default:
        return (
          <div className="dashboard-overview">
            <div className="stats-grid">
              <div className="stat-card total">
                <i className="fas fa-calendar-check"></i>
                <h3>{appointments.length}</h3>
                <p>Total Appointments</p>
              </div>
              <div className="stat-card pending">
                <i className="fas fa-clock"></i>
                <h3>
                  {
                    appointments.filter((apt) => apt.status === "Pending")
                      .length
                  }
                </h3>
                <p>Pending</p>
              </div>
              <div className="stat-card approved">
                <i className="fas fa-check-circle"></i>
                <h3>
                  {
                    appointments.filter((apt) => apt.status === "Approved")
                      .length
                  }
                </h3>
                <p>Approved</p>
              </div>
            </div>
            <div className="recent-section">
              <h3>Recent Appointments</h3>
              <div className="recent-appointments">
                {appointments.slice(0, 3).map((apt) => (
                  <div key={apt._id} className="recent-appointment-card">
                    <div className="appointment-info">
                      <h4>Dr. {apt.doctor.name}</h4>
                      <p>
                        {new Date(apt.date).toLocaleDateString()} - {apt.time}
                      </p>
                    </div>
                    <span
                      className={`status-badge ${apt.status.toLowerCase()}`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="profile-section">
          <div className="profile-image">
            <img src="https://via.placeholder.com/150" alt="Profile" />
          </div>
          <h3>{user?.name}</h3>
          <p className="email">{user?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-link ${activeTab === "smartwatch" ? "active" : ""}`}
            onClick={() => setActiveTab("smartwatch")}
          >
            <i className="fas fa-watch"></i>
            <span>Connect Smartwatch</span>
          </button>
          <button
            className={`nav-link ${
              activeTab === "appointments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("appointments")}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Appointments</span>
          </button>
          <button
            className={`nav-link ${activeTab === "book" ? "active" : ""}`}
            onClick={() => setActiveTab("book")}
          >
            <i className="fas fa-plus-circle"></i>
            <span>Book Appointment</span>
          </button>
          <button
            className={`nav-link ${activeTab === "sync" ? "active" : ""}`}
            onClick={() => setActiveTab("sync")}
          >
            <i className="fas fa-sync"></i>
            <span>Health Data</span>
          </button>
        </nav>


        <div className="sidebar-footer">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fas fa-bell"></i>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
        </div>

        {showNotifications && (
          <div className="notifications-popup">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className="notification-item">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-notifications">No new notifications</p>
              )}
            </div>
          </div>
        )}

        <div className="dashboard-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PatientDashboard;
