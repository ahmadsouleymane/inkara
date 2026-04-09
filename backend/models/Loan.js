import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  borrowDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'late'],
    default: 'borrowed',
  },
  renewCount: {
    type: Number,
    default: 0,
    max: 2,
  },
  // Le bibliothécaire qui a effectué l'emprunt
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Le bibliothécaire qui a enregistré le retour
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index composés pour les requêtes courantes
loanSchema.index({ organizationId: 1, status: 1, dueDate: 1 });
loanSchema.index({ organizationId: 1, user: 1, status: 1 });

export default mongoose.model('Loan', loanSchema);
