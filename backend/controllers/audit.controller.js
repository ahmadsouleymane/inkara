import AuditLog from '../models/AuditLog.js';

// GET /api/audit
export const getAuditLogs = async (req, res) => {
  try {
    const { action, entity, page = 1, limit = 30 } = req.query;
    const query = { organizationId: req.organizationId };
    if (action) query.action = { $regex: action, $options: 'i' };
    if (entity) query.entity = entity;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
