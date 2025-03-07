import express from 'express';
import User from '../models/User.js';
import userAuth from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import seller from '../middleware/sellerMiddleware.js';
import Book from '../models/book.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Debugging: Check if environment variables are loaded
console.log("Cloudinary Name:", process.env.CLOUDINARY_NAME);
console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
console.log("Cloudinary API Secret:", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BookAction = express.Router();

// Add a new book
BookAction.post('/addbook', userAuth, seller, upload.single('book_image'), async (req, res) => {
    try {
        const { isbn, title, publisher, language, category, author, search_tag, no_page, edition, stock, description, price } = req.body;
        const { userId } = req.user;

        if (!isbn || !title || !author || !price) {
            return res.status(400).json({ message: 'ISBN, title, author, and price are required' });
        }

        let bookImageUrl = null;

        if (req.file) {
            try {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'book_images' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });

                bookImageUrl = result.secure_url;
            } catch (error) {
                return res.status(500).json({ message: 'Error uploading image to Cloudinary', error: error.message });
            }
        }

        const book = new Book({
            isbn,
            title,
            publisher,
            language,
            category,
            author,
            search_tag,
            no_page,
            edition,
            stock,
            description,
            price,
            image: bookImageUrl,
            seller: userId
        });

        await book.save();

        res.status(201).json({
            success: true,
            message: 'Book added successfully!',
            data: book
        });
    } catch (error) {
        console.error('Error adding book:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding book. Please try again.',
            error: error.message
        });
    }
});

// Edit an existing book
BookAction.put('/editbook/:id', userAuth, seller, upload.single('book_image'), async (req, res) => {
    console.log('Received PUT request for book ID:', req.params.id);
    try {
        const bookId = req.params.id;
        const { isbn, title, publisher, language, category, author, search_tag, no_page, edition, stock, description, price } = req.body;
        const { userId } = req.user;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.seller.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this book' });
        }

        if (req.file) {
            if (book.image) {
                const publicId = path.basename(book.image, path.extname(book.image));
                await cloudinary.uploader.destroy(`book_images/${publicId}`);
            }

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'book_images' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            book.image = result.secure_url;
        }

        Object.assign(book, {
            isbn: isbn || book.isbn,
            title: title || book.title,
            publisher: publisher || book.publisher,
            language: language || book.language,
            category: category || book.category,
            author: author || book.author,
            search_tag: search_tag || book.search_tag,
            no_page: no_page || book.no_page,
            edition: edition || book.edition,
            stock: stock || book.stock,
            description: description || book.description,
            price: price || book.price,
        });

        await book.save();

        res.status(200).json({
            success: true,
            message: 'Book updated successfully!',
            data: book
        });
    } catch (error) {
        console.error('Error updating book:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating book. Please try again.',
            error: error.message
        });
    }
});

// Soft delete a book
BookAction.delete('/deletebook/:id', userAuth, seller, async (req, res) => {
    console.log('Received DELETE request for book ID:', req.params.id);
    try {
        const bookId = req.params.id;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.seller.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this book' });
        }

        book.is_del = true;
        await book.save();
        res.status(200).json({
            success: true,
            message: 'Book deleted successfully!'
        });
    } catch (error) {
        console.error('Error deleting book:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting book. Please try again.',
            error: error.message
        });
    }
});

// View all books uploaded by the seller
BookAction.get('/mybooks', userAuth, seller, async (req, res) => {
    try {
        const { userId } = req.user;

        const books = await Book.find({ seller: userId, is_del: false });
        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }

        const totalBooks = await Book.countDocuments({ seller: userId, is_del: false });
        console.log("Total books:", totalBooks);

        res.status(200).json({
            success: true,
            message: 'Books fetched successfully!',
            data: books
        });
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching books. Please try again.',
            error: error.message
        });
    }
});

// View all books
BookAction.get('/books', async (req, res) => {
    try {
        const filters = { is_del: false };

        const books = await Book.find(filters);
        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }

        const totalBooks = await Book.countDocuments(filters);
        console.log("Total books:", totalBooks);

        res.status(200).json({
            success: true,
            message: 'Books fetched successfully!',
            data: books,
            totalBooks: totalBooks
        });
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching books. Please try again.',
            error: error.message
        });
    }
});

// Add stock to a book
BookAction.put('/addstock/:id', userAuth, seller, async (req, res) => {
    console.log('Received PUT request for book ID:', req.params.id);
    try {
        const bookId = req.params.id;
        const { stock } = req.body;

        if (!stock) {
            return res.status(400).json({ message: 'Stock is required' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.seller.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to add stock to this book' });
        }

        book.stock += parseInt(stock, 10);

        await book.save();
        res.status(200).json({
            success: true,
            message: 'Stock added successfully!',
            data: book
        });
    } catch (error) {
        console.error('Error adding stock:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error adding stock. Please try again.',
            error: error.message
        });
    }
});

export default BookAction;
