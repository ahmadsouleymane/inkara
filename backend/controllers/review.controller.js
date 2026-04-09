import Review from '../models/Review.js';

// POST /api/reviews — Créer ou mettre à jour un avis
export const upsertReview = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { user: req.user._id, book: bookId, organizationId: req.organizationId },
      { rating, comment, user: req.user._id, book: bookId, organizationId: req.organizationId },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/reviews/book/:bookId
export const getBookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId, organizationId: req.organizationId })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });

    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!review) return res.status(404).json({ message: 'Avis introuvable.' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    await review.deleteOne();
    res.json({ message: 'Avis supprimé.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
