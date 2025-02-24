import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    createAppointment, 
    getDoctors, 
    getDoctorAppointments,
    getMyAppointments,  // Add this import
    updateAppointmentStatus,
    getPatientNotifications,
    getHealthData
} from '../controllers/appointmentController.js';

const router = express.Router();

// Add the new route
router.get('/my-appointments', protect, getMyAppointments);

// Existing routes
router.post('/create', protect, createAppointment);
router.get('/doctors', protect, getDoctors);
router.get('/doctor-appointments', protect, getDoctorAppointments);
router.put('/update-status/:id', protect, updateAppointmentStatus);
router.get('/notifications', protect, getPatientNotifications);
router.get('/health-data', protect, getHealthData);

export default router;