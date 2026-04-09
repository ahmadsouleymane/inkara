import mongoose from 'mongoose';

const userBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  badge: {
    type: String,
    enum: [
      'first_loan',        // Premier emprunt
      'bookworm_10',       // 10 livres lus
      'bookworm_50',       // 50 livres lus
      'bookworm_100',      // 100 livres lus
      'speed_reader',      // 5 livres en un mois
      'genre_explorer',    // 5 catégories différentes
      'early_bird',        // Retourné avant l'échéance 10 fois
      'event_goer',        // Participé à 5 événements
      'reviewer',          // 10 avis laissés
      'list_curator',      // Créé 3 listes de lecture
      'loyal_member',      // Membre depuis 1 an
      'perfect_record',    // 0 retard sur 20+ emprunts
    ],
    required: true,
  },
  awardedAt: { type: Date, default: Date.now },
});

userBadgeSchema.index({ user: 1, organizationId: 1, badge: 1 }, { unique: true });

export default mongoose.model('UserBadge', userBadgeSchema);
