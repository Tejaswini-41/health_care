import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, symptoms } = req.body;
        const patientId = req.userId; // From auth middleware

        // Validate doctor exists
        const doctor = await User.findOne({ _id: doctorId, role: 'Doctor' });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Create appointment
        const appointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            date,
            time,
            symptoms
        });

        // Populate patient and doctor details
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'name email')
            .populate('doctor', 'name email specialization');

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment: populatedAppointment
        });

    } catch (error) {
        console.error('Appointment creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking appointment',
            error: error.message
        });
    }
};

export const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'Doctor' })
            .select('name email specialization experience');
        
        res.status(200).json({
            success: true,
            doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};

export const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.userId })
            .populate('patient', 'name email')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, doctor: req.userId },
            { status },
            { new: true }
        ).populate('patient', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
            error: error.message
        });
    }
};