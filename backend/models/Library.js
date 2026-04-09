import mongoose from 'mongoose';

// Profil de la bibliothèque (singleton) — utilisé pour le mini-site public
const librarySchema = new mongoose.Schema({
  singleton: {
    type: String,
    unique: true,
    default: 'library',
  },
  name: {
    type: String,
    default: 'Ma Bibliothèque',
  },
  logo: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  openingHours: {
    type: String,
    default: '',
  },
  // Paramètres de prêt
  maxLoansPerUser: {
    type: Number,
    default: 3,
  },
  loanDurationDays: {
    type: Number,
    default: 14,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  featuredBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Library', librarySchema);
