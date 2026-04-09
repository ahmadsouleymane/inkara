import Organization from '../models/Organization.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { getPlanLimits } from '../config/plans.js';

/**
 * Middleware factory to check plan limits.
 * @param {string} feature - Feature to check: 'books', 'members', 'publicSite', 'email', 'sms', 'broadcast', 'customDomain'
 */
export const planGate = (feature) => {
  return async (req, res, next) => {
    try {
      const org = await Organization.findById(req.organizationId);
      if (!org) return res.status(404).json({ message: 'Organisation introuvable.' });

      const plan = org.plan || 'free';
      const limits = getPlanLimits(plan);

      // Boolean features
      if (typeof limits[feature] === 'boolean') {
        if (!limits[feature]) {
          return res.status(403).json({
            message: `Cette fonctionnalité nécessite un plan supérieur.`,
            requiredPlan: feature === 'sms' ? 'enterprise' : 'pro',
            feature,
          });
        }
        return next();
      }

      // Numeric limits
      if (feature === 'books') {
        const count = await Book.countDocuments({ organizationId: req.organizationId });
        if (count >= limits.books) {
          return res.status(403).json({
            message: `Limite de ${limits.books} livres atteinte pour votre plan.`,
            limit: limits.books,
            current: count,
            feature,
          });
        }
      } else if (feature === 'members') {
        const count = await User.countDocuments({ organizationId: req.organizationId });
        if (count >= limits.members) {
          return res.status(403).json({
            message: `Limite de ${limits.members} membres atteinte pour votre plan.`,
            limit: limits.members,
            current: count,
            feature,
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
