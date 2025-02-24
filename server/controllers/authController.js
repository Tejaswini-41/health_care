import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Registration Logic
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, specialization, experience } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user object based on role
        const userData = {
            name,
            email,
            password,
            role
        };

        // Add doctor-specific fields if role is Doctor
        if (role === 'Doctor') {
            userData.specialization = specialization;
            userData.experience = experience;
        }

        const user = await User.create(userData);

        if (user) {
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.status(201).json({
                message: 'Registration successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    ...(user.role === 'Doctor' && {
                        specialization: user.specialization,
                        experience: user.experience
                    })
                },
                token
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Login Logic
export const loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.role !== role) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',  // Token expires in 1 hour
        });

        res.json({
            message: 'Login successful!',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Profile Logic
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId; 
        const user = await User.findById(userId).select('-password');  // Exclude password from the response

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);  // Send back the user details
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};