import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import AuditLog from '../models/AuditLog.js';

// GET /api/superadmin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrganizations,
      totalUsers,
      totalLoans,
      proCount,
      enterpriseCount,
      recentOrgs,
      planDistribution,
      monthlySignups,
    ] = await Promise.all([
      Organization.countDocuments(),
      User.countDocuments(),
      Loan.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Organization.countDocuments({ plan: 'pro' }),
      Organization.countDocuments({ plan: 'enterprise' }),
      Organization.find()
        .populate('owner', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Organization.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      Organization.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const mrr = proCount * 29.99 + enterpriseCount * 99.99;

    res.json({
      totalOrganizations,
      totalUsers,
      totalLoans,
      mrr,
      recentOrgs,
      planDistribution,
      monthlySignups,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/superadmin/organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const [organizations, total] = await Promise.all([
      Organization.find(filter)
        .populate('owner', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Organization.countDocuments(filter),
    ]);

    res.json({
      organizations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getAllOrganizations error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/superadmin/organizations/:id/plan
export const updateOrganizationPlan = async (req, res) => {
  try {
    const { plan, planExpiresAt } = req.body;

    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { plan, planExpiresAt },
      { new: true }
    ).populate('owner', 'fullName email');

    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    await AuditLog.create({
      user: req.user._id,
      organizationId: org._id,
      action: 'UPDATE_PLAN',
      entity: 'Organization',
      entityId: org._id,
      details: { plan, planExpiresAt },
    });

    res.json(org);
  } catch (error) {
    console.error('updateOrganizationPlan error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/superadmin/organizations/:id/suspend
export const suspendOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { isPublished: false },
      { new: true }
    ).populate('owner', 'fullName email');

    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    await AuditLog.create({
      user: req.user._id,
      organizationId: org._id,
      action: 'SUSPEND_ORGANIZATION',
      entity: 'Organization',
      entityId: org._id,
      details: { suspended: true },
    });

    res.json(org);
  } catch (error) {
    console.error('suspendOrganization error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
