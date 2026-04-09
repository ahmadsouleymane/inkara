import Book from '../models/Book.js';

// GET /api/search/suggest?q=... — Autocomplétion fuzzy
export const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const orgFilter = { organizationId: req.organizationId };

    // Recherche par regex (fuzzy simple) sur titre, auteur, ISBN
    const regex = new RegExp(q.split('').join('.*'), 'i');
    const exactRegex = new RegExp(q, 'i');

    const books = await Book.find({
      ...orgFilter,
      $or: [
        { title: { $regex: exactRegex } },
        { author: { $regex: exactRegex } },
        { isbn: { $regex: exactRegex } },
        { title: { $regex: regex } },
      ],
    })
      .select('title author isbn cover category availableCopies')
      .limit(5)
      .sort({ title: 1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/search?q=...&category=...&author=...&page=1&limit=20 — Recherche complète
export const searchBooks = async (req, res) => {
  try {
    const { q, category, author, language, format, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.organizationId };

    if (q && q.length >= 2) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { title: { $regex: regex } },
        { author: { $regex: regex } },
        { isbn: { $regex: regex } },
        { tags: { $regex: regex } },
        { subjects: { $regex: regex } },
      ];
    }

    if (category) query.category = category;
    if (author) query.author = { $regex: new RegExp(author, 'i') };
    if (language) query.language = language;
    if (format) query.format = format;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ books, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
