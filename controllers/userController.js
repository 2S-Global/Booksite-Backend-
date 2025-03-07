import User from '../models/userModel.js';

export const createUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const newUser = new User({ name, email, phone, password });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully!',
            data: newUser
        });
    } 
    catch (error) {
        console.error('Error creating user:', error);

        if (error.name === 'ValidationError') {
           
            const formattedErrors = {};
            for (const field in error.errors) {
                formattedErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({
                success: false,
                errors: formattedErrors
            });
        }


        res.status(500).json({
            success: false,
            message: 'Error creating user. Please try again.',
            error: error.message
        });
    }
    
    /* catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user. Please try again.',
            error: error.message
        });
    } */
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: user
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in user. Please try again.',
            error: error.message
        });
    }
};
