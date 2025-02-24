import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,  // Added email to response
                role: user.role,
                ...(user.role === 'Doctor' && {
                    specialization: user.specialization,
                    experience: user.experience
                })
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching profile',
            error: error.message 
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'Doctor') {
            const { name, specialization, experience } = req.body;
            user.name = name || user.name;
            user.specialization = specialization || user.specialization;
            user.experience = experience || user.experience;
        } else {
            const { name } = req.body;
            user.name = name || user.name;
        }

        const updatedUser = await user.save();
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                ...(updatedUser.role === 'Doctor' && {
                    specialization: updatedUser.specialization,
                    experience: updatedUser.experience
                })
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};