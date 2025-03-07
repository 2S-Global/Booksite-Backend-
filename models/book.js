import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    isbn: { type: String, required: true },
    title: { type: String, required: true },
    publisher: { type: String, required: true },
    image: { type: String, required: false },
    language: { type: String, required: false },
    category: { type: String, required: false },
    author: { type: String, required: false },
    search_tag: { type: String, required: false },
    no_page: { type: String, required: false },
    edition: { type: String, required: false },
    stock: { type: Number, required: false },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    seller: { type: String, required: true },
    is_del: { type: Boolean, required: false, default: 0 }
});

const Book = mongoose.model("Book", bookSchema);

export default Book;