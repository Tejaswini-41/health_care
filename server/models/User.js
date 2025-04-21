import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     role: {
//         type: String,
//         enum: ['Patient', 'Doctor'],
//         required: true
//     },
//     specialization: {
//         type: String,
//         required: function() {
//             return this.role === 'Doctor';
//         }
//     },
//     experience: {
//         type: Number,
//         required: function() {
//             return this.role === 'Doctor';
//         }
//     }
// }, {
//     timestamps: true
// });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Patient', 'Doctor'], required: true },
    specialization: {
        type: String,
        required: function () { return this.role === 'Doctor'; }
    },
    experience: {
        type: Number,
        required: function () { return this.role === 'Doctor'; }
    },
    googleFitTokens: {
        access_token: String,
        refresh_token: String,
        scope: String,
        token_type: String,
        expiry_date: Number
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Add this method to your User schema
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;