import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    notifications: [{
        message: String,
        isRead: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    age: {
        type: Number,
        required: false
    },
    bmi: {
        type: Number,
        required: false
    },
    heart_rate: {
        type: [Number],
        required: false
    },
    activity_levels: {
        type: [[Number]],  // Array of arrays containing [steps, duration, calories]
        required: false
    },
    medical_history: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;