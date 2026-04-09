import mongoose from 'mongoose';

const presenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  checkIn: { type: Date, default: Date.now },
  checkOut: { type: Date },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

presenceSchema.index({ organizationId: 1, checkIn: -1 });

export default mongoose.model('Presence', presenceSchema);
