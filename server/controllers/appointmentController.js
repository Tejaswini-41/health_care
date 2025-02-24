import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, symptoms } = req.body;
        const appointment = await Appointment.create({
            patient: req.userId,
            doctor: doctorId,
            date,
            time,
            symptoms
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating appointment',
            error: error.message
        });
    }
};

export const getAvailableDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'Doctor' })
            .select('name email');
        
        res.status(200).json({
            success: true,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};