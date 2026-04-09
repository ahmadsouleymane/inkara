import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  amount: { type: Number, required: true, min: 0 },
  daysLate: { type: Number, default: 0 },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt: { type: Date },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

fineSchema.index({ organizationId: 1, status: 1 });
fineSchema.index({ user: 1, organizationId: 1 });

export default mongoose.model('Fine', fineSchema);
