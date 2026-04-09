import Organization from '../models/Organization.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { PLANS, getPlanLimits, getPlanName } from '../config/plans.js';

// GET /api/plan
export const getCurrentPlan = async (req, res) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) return res.status(404).json({ message: 'Organisation introuvable.' });

    const plan = org.plan || 'free';
    const limits = getPlanLimits(plan);

    // Current usage
    const booksCount = await Book.countDocuments({ organizationId: req.organizationId });
    const membersCount = await User.countDocuments({ organizationId: req.organizationId });

    res.json({
      plan,
      planName: getPlanName(plan),
      limits,
      usage: {
        books: booksCount,
        members: membersCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/plan/compare
export const comparePlans = async (req, res) => {
  try {
    const org = await Organization.findById(req.organizationId);
    const currentPlan = org?.plan || 'free';

    const plans = Object.entries(PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      limits: {
        ...plan.limits,
        books: plan.limits.books === Infinity ? 'Illimité' : plan.limits.books,
        members: plan.limits.members === Infinity ? 'Illimité' : plan.limits.members,
        siteTemplates: plan.limits.siteTemplates === Infinity ? 'Illimité' : plan.limits.siteTemplates,
        readingLists: plan.limits.readingLists === Infinity ? 'Illimité' : plan.limits.readingLists,
      },
      isCurrent: id === currentPlan,
    }));

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/plan (superadmin only)
export const updatePlan = async (req, res) => {
  try {
    const { organizationId, plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Plan invalide.' });

    const org = await Organization.findByIdAndUpdate(
      organizationId || req.organizationId,
      { plan },
      { new: true }
    );

    if (!org) return res.status(404).json({ message: 'Organisation introuvable.' });
    res.json({ message: `Plan mis à jour vers ${PLANS[plan].name}.`, plan: org.plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
