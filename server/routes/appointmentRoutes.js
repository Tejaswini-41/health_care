import express from 'express';
import { protect } from '../controllers/authController.js';
import { createAppointment, getDoctors } from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/create', protect, createAppointment);
router.get('/doctors', protect, getDoctors);

export default router;