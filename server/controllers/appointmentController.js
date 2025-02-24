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
        const appointment = await Appointment.findById(req.params.id)
            .populate('doctor', 'name specialization')
            .populate('patient', 'name email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        
        // Add notification based on status
        const notification = {
            message: status === 'Approved' 
                ? `Dr. ${appointment.doctor.name} has approved your appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. Please be on time.`
                : `Dr. ${appointment.doctor.name} has rejected your appointment request for ${new Date(appointment.date).toLocaleDateString()}.`,
            isRead: false
        };

        appointment.notifications.push(notification);
        await appointment.save();

        res.json({
            success: true,
            appointment,
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
            error: error.message
        });
    }
};

// Add new endpoint to get patient's notifications
export const getPatientNotifications = async (req, res) => {
    try {
        const appointments = await Appointment.find({ 
            patient: req.userId,
            'notifications.isRead': false 
        })
        .populate('doctor', 'name specialization')
        .sort({ 'notifications.createdAt': -1 });

        const notifications = appointments.flatMap(apt => 
            apt.notifications.filter(n => !n.isRead)
        );

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};