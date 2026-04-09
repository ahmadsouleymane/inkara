import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';
import Notification from '../models/Notification.js';

// POST /api/reservations
export const createReservation = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findOne({ _id: bookId, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });
    if (book.availableCopies > 0) return res.status(400).json({ message: 'Ce livre est disponible, pas besoin de réserver.' });

    const existing = await Reservation.findOne({ user: req.user._id, book: bookId, organizationId: req.organizationId, status: 'pending' });
    if (existing) return res.status(400).json({ message: 'Vous avez déjà une réservation pour ce livre.' });

    const reservation = await Reservation.create({ user: req.user._id, book: bookId, organizationId: req.organizationId });
    res.status(201).json(reservation);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// DELETE /api/reservations/:id
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, user: req.user._id, organizationId: req.organizationId });
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable.' });

    reservation.status = 'cancelled';
    await reservation.save();
    res.json({ message: 'Réservation annulée.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/reservations/me
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id, organizationId: req.organizationId })
      .populate('book', 'title author cover')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/reservations/book/:bookId
export const getBookQueue = async (req, res) => {
  try {
    const reservations = await Reservation.find({ book: req.params.bookId, organizationId: req.organizationId, status: 'pending' })
      .populate('user', 'fullName email')
      .sort({ createdAt: 1 });
    res.json(reservations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/reservations
export const getAllReservations = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { organizationId: req.organizationId };
    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('user', 'fullName email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
