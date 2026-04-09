import { lookupByISBN } from '../services/bookLookup.service.js';

// GET /api/lookup/isbn/:isbn — Chercher un livre par ISBN
export const lookupISBN = async (req, res) => {
  try {
    const { isbn } = req.params;
    if (!isbn || isbn.length < 10) {
      return res.status(400).json({ message: 'ISBN invalide (minimum 10 caractères).' });
    }

    const result = await lookupByISBN(isbn);
    if (!result) {
      return res.status(404).json({ message: 'Aucun résultat trouvé pour cet ISBN.' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
