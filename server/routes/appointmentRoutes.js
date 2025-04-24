import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  createAppointment,
  getDoctors,
  getDoctorAppointments,
  getMyAppointments,
  updateAppointmentStatus,
  getPatientNotifications,
  getHealthData
} from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/create', protect, upload.single('medical_report'), createAppointment);
// 👆 use multer here

router.get('/doctors', protect, getDoctors);
router.get('/doctor-appointments', protect, getDoctorAppointments);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/update-status/:id', protect, updateAppointmentStatus);
router.get('/notifications', protect, getPatientNotifications);
router.get('/health-data', protect, getHealthData);

export default router;
