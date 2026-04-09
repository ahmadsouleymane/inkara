import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  isbn: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
  },
  author: {
    type: [String],
    required: [true, "L'auteur est requis"],
  },
  publisher: {
    type: String,
    default: '',
  },
  year: {
    type: String,
    default: '',
  },
  pages: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
  },
  cover: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  copies: {
    type: Number,
    default: 1,
    min: 0,
  },
  availableCopies: {
    type: Number,
    default: 1,
    min: 0,
  },
  condition: {
    type: String,
    enum: ['neuf', 'bon', 'usé', 'endommagé'],
    default: 'bon',
  },
  language: {
    type: String,
    default: '',
  },
  format: {
    type: String,
    enum: ['physical', 'ebook', 'audiobook'],
    default: 'physical',
  },
  tags: {
    type: [String],
    default: [],
  },
  subjects: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    default: '',
  },
  qrCode: {
    type: String,
    default: '',
  },
  qrCodeData: {
    type: String,
    default: '',
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index composé pour la recherche scopée par organisation
bookSchema.index({ organizationId: 1, title: 'text', author: 'text', isbn: 'text' });
// Index pour les requêtes courantes
bookSchema.index({ organizationId: 1, category: 1 });
bookSchema.index({ organizationId: 1, availableCopies: 1 });

export default mongoose.model('Book', bookSchema);
