import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  status: { type: String, enum: ['pending', 'available', 'cancelled', 'expired'], default: 'pending' },
  notifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

reservationSchema.index({ organizationId: 1, book: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);
