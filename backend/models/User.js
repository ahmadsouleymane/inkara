import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['member', 'librarian', 'owner', 'admin', 'superadmin'],
    default: 'member',
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  // Champs optionnels pour les membres
  membershipId: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    default: '',
  },
  qrCode: {
    type: String,
    default: '',
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    dueSoonReminder: { type: Boolean, default: true },
    overdueAlert: { type: Boolean, default: true },
    reservationAvailable: { type: Boolean, default: true },
    fineCreated: { type: Boolean, default: true },
    eventReminder: { type: Boolean, default: true },
    newBooksDigest: { type: Boolean, default: false },
  },
  readingGoal: {
    target: { type: Number, default: 0 },
    year: { type: Number, default: new Date().getFullYear() },
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ne jamais renvoyer le mot de passe dans les réponses JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export default mongoose.model('User', userSchema);
