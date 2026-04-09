import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import AuditLog from '../models/AuditLog.js';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/books
export const getBooks = async (req, res) => {
  try {
    const { search, category, author, year, condition, sort, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.organizationId };

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { author: { $regex: safeSearch, $options: 'i' } },
        { isbn: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (author) query.author = { $regex: escapeRegex(author), $options: 'i' };
    if (year) query.year = year;
    if (condition) query.condition = condition;

    let sortOption = { createdAt: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'year') sortOption = { year: -1 };
    if (sort === 'available') sortOption = { availableCopies: -1 };

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ books, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/stats
export const getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({ organizationId: req.organizationId });
    const availableBooks = await Book.countDocuments({ organizationId: req.organizationId, availableCopies: { $gt: 0 } });
    const categories = await Book.distinct('category', { organizationId: req.organizationId });
    res.json({ totalBooks, availableBooks, totalCategories: categories.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/recommendations
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.query.userId;
    let recommended;

    if (userId) {
      // Recommandations basées sur les catégories empruntées
      const userLoans = await Loan.find({ user: userId, organizationId: req.organizationId }).populate('book', 'category');
      const categories = [...new Set(userLoans.map(l => l.book?.category).filter(Boolean))];

      if (categories.length > 0) {
        recommended = await Book.find({ organizationId: req.organizationId, category: { $in: categories }, availableCopies: { $gt: 0 } })
          .limit(10)
          .sort({ createdAt: -1 });
      }
    }

    if (!recommended || recommended.length === 0) {
      recommended = await Book.find({ organizationId: req.organizationId, availableCopies: { $gt: 0 } }).limit(10).sort({ createdAt: -1 });
    }

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/isbn/:isbn
export const getBookByIsbn = async (req, res) => {
  try {
    const book = await Book.findOne({ isbn: req.params.isbn, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/:id
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books
export const addBook = async (req, res) => {
  try {
    const bookData = { ...req.body, addedBy: req.user._id, organizationId: req.organizationId };
    if (req.file) bookData.cover = `/uploads/${req.file.filename}`;
    if (!bookData.availableCopies && bookData.copies) bookData.availableCopies = bookData.copies;

    // Parser les champs JSON (author, tags, subjects)
    if (typeof bookData.author === 'string') {
      try { bookData.author = JSON.parse(bookData.author); } catch {}
    }
    if (typeof bookData.tags === 'string') {
      try { bookData.tags = JSON.parse(bookData.tags); } catch {}
    }
    if (typeof bookData.subjects === 'string') {
      try { bookData.subjects = JSON.parse(bookData.subjects); } catch {}
    }

    const book = await Book.create(bookData);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/books/:id
export const updateBook = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.cover = `/uploads/${req.file.filename}`;

    if (typeof updateData.author === 'string') {
      try { updateData.author = JSON.parse(updateData.author); } catch {}
    }
    if (typeof updateData.tags === 'string') {
      try { updateData.tags = JSON.parse(updateData.tags); } catch {}
    }
    if (typeof updateData.subjects === 'string') {
      try { updateData.subjects = JSON.parse(updateData.subjects); } catch {}
    }

    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/:id
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });
    await AuditLog.create({ user: req.user._id, organizationId: req.organizationId, action: 'delete_book', entity: 'Book', entityId: book._id, details: { title: book.title } });
    res.json({ message: 'Livre supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books/import-csv
export const importBooksFromCsv = async (req, res) => {
  try {
    const { parse } = await import('csv-parse/sync');
    if (!req.file) return res.status(400).json({ message: 'Fichier CSV requis.' });

    const records = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true });
    const results = { created: 0, errors: [] };

    for (const row of records) {
      try {
        const title = (row.title || row.titre || '').trim();
        if (!title) {
          results.errors.push('Ligne ignorée : titre manquant');
          continue;
        }
        await Book.create({
          title,
          author: (row.author || row.auteur || '').split(',').map(a => a.trim()),
          isbn: row.isbn || '',
          publisher: row.publisher || row.editeur || '',
          year: row.year || row.annee || '',
          pages: Number(row.pages) || 0,
          category: row.category || row.categorie || 'Général',
          copies: Number(row.copies || row.exemplaires) || 1,
          availableCopies: Number(row.copies || row.exemplaires) || 1,
          cover: row.cover || '',
          addedBy: req.user._id,
          organizationId: req.organizationId,
        });
        results.created++;
      } catch (err) {
        results.errors.push(`${row.title}: ${err.message}`);
      }
    }

    res.json({ message: `${results.created} livres importés.`, errors: results.errors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== OPÉRATIONS EN LOT =====

// PUT /api/books/bulk/update
export const bulkUpdate = async (req, res) => {
  try {
    const { bookIds, updates } = req.body;
    if (!bookIds?.length) return res.status(400).json({ message: 'Aucun livre sélectionné.' });

    const allowed = {};
    if (updates.category !== undefined) allowed.category = updates.category;
    if (updates.condition !== undefined) allowed.condition = updates.condition;
    if (updates.language !== undefined) allowed.language = updates.language;
    if (updates.format !== undefined) allowed.format = updates.format;

    const result = await Book.updateMany(
      { _id: { $in: bookIds }, organizationId: req.organizationId },
      { $set: allowed }
    );

    res.json({ message: `${result.modifiedCount} livre(s) mis à jour.`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/bulk/delete
export const bulkDelete = async (req, res) => {
  try {
    const { bookIds } = req.body;
    if (!bookIds?.length) return res.status(400).json({ message: 'Aucun livre sélectionné.' });

    const result = await Book.deleteMany(
      { _id: { $in: bookIds }, organizationId: req.organizationId }
    );

    res.json({ message: `${result.deletedCount} livre(s) supprimé(s).`, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/books/bulk/category
export const bulkCategoryChange = async (req, res) => {
  try {
    const { bookIds, category } = req.body;
    if (!bookIds?.length || !category) return res.status(400).json({ message: 'Livres et catégorie requis.' });

    const result = await Book.updateMany(
      { _id: { $in: bookIds }, organizationId: req.organizationId },
      { $set: { category } }
    );

    res.json({ message: `${result.modifiedCount} livre(s) déplacé(s) vers "${category}".`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
