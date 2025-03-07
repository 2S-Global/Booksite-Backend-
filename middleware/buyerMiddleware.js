import User from '../models/User.js'; // Adjust the path as needed

const buyer = async (req, res, next) => {
    try {
        // Ensure that the user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized: Please log in to access this resource.' });
        }

        // Fetch the user by userId
        const user = await User.findById(req.user.userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Log the role_id to verify its value
        console.log('Name:', user.name);
        console.log('Id:', user._id);
        console.log('User role_id:', user.role_id);

        // Check if the user's role_id is 3 (buyer role)
        if (user.role_id !== "3") {
            return res.status(403).json({ message: 'You are not authorized to access this resource.' });
        }


        next();
    } catch (error) {
        // Handle any unexpected errors
        return res.status(500).json({ message: 'An error occurred while verifying your role.', error: error.message });
    }
};

export default buyer;
