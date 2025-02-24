import express from 'express';
import { protect } from '../controllers/authController.js';
import { 
    createAppointment, 
    getDoctors, 
    getDoctorAppointments, 
    updateAppointmentStatus,
    getPatientNotifications,
    getHealthData
} from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/create', protect, createAppointment);
router.get('/doctors', protect, getDoctors);
router.get('/doctor-appointments', protect, getDoctorAppointments);
router.put('/update-status/:id', protect, updateAppointmentStatus);
router.get('/notifications', protect, getPatientNotifications);
router.get('/health-data',  getHealthData);

export default router;