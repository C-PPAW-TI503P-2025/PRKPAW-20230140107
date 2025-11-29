const express = require('express');
const router = express.Router();

// Menggunakan array sebagai penyimpanan data sementara [cite: 142]
let books = [
  { id: 1, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer' },
  { id: 2, title: 'Laskar Pelangi', author: 'Andrea Hirata' }
];

// READ: Mendapatkan semua buku (GET /api/books)
router.get('/', (req, res) => {
  res.json(books);
});

// READ: Mendapatkan buku berdasarkan ID (GET /api/books/:id)
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// CREATE: Menambahkan buku baru (POST /api/books)
router.post('/', (req, res) => {
  // Implementasi validasi input [cite: 143]
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const newBook = {
    id: books.length ? books[books.length - 1].id + 1 : 1, // Generate new ID
    title,
    author
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// UPDATE: Memperbarui data buku (PUT /api/books/:id)
router.put('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ message: 'Book not found' });

  // Implementasi validasi input [cite: 143]
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  book.title = title;
  book.author = author;
  res.json(book);
});

// DELETE: Menghapus buku (DELETE /api/books/:id)
router.delete('/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) return res.status(404).json({ message: 'Book not found' });

  books.splice(bookIndex, 1);
  res.status(204).send(); // 204 No Content
});

module.exports = router;