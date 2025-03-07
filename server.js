import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import action from './routes/userActionRoutes.js';
import BookAction from './routes/BookRoutes.js';
import colors from 'colors';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
db();

// Debugging: Check if environment variables are loaded correctly
console.log("Cloudinary Name:", process.env.CLOUDINARY_NAME);
console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
console.log("Cloudinary API Secret:", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Root route to show a welcome message
app.get('/', (req, res) => {
    res.send('Welcome to the back end');
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/user/actions', action);
app.use('/api/v1/book', BookAction);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.',
        error: err.message
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.cyan.bold);
});
