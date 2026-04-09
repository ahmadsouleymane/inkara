import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true,
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

categorySchema.index({ name: 1, organizationId: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
