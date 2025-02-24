import express from 'express';
import { createAppointment, getAvailableDoctors } from '../controllers/appointmentController.js';
import protect from '../middleware/auth.js';


const router = express.Router();

router.post('/create', protect, createAppointment);
router.get('/doctors', protect, getAvailableDoctors);

export default router;