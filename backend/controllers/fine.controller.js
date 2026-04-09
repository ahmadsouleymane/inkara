import Fine from '../models/Fine.js';
import AuditLog from '../models/AuditLog.js';

// GET /api/fines — Toutes les amendes
export const getAllFines = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.organizationId };
    if (status) query.status = status;

    const total = await Fine.countDocuments(query);
    const fines = await Fine.find(query)
      .populate('user', 'fullName email')
      .populate('loan')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ fines, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/fines/user/:userId
export const getUserFines = async (req, res) => {
  try {
    const fines = await Fine.find({ user: req.params.userId, organizationId: req.organizationId })
      .populate('loan')
      .sort({ createdAt: -1 });
    res.json(fines);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// PUT /api/fines/:id/pay
export const payFine = async (req, res) => {
  try {
    const fine = await Fine.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!fine) return res.status(404).json({ message: 'Amende introuvable.' });
    if (fine.status === 'paid') return res.status(400).json({ message: 'Amende déjà payée.' });

    fine.status = 'paid';
    fine.paidAt = new Date();
    fine.paidBy = req.user._id;
    await fine.save();

    await AuditLog.create({ user: req.user._id, organizationId: req.organizationId, action: 'pay_fine', entity: 'Fine', entityId: fine._id, details: { amount: fine.amount } });

    res.json(fine);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// POST /api/fines — Amende manuelle
export const createManualFine = async (req, res) => {
  try {
    const { userId, loanId, amount, reason } = req.body;
    const fine = await Fine.create({ user: userId, loan: loanId, organizationId: req.organizationId, amount, reason });
    res.status(201).json(fine);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// DELETE /api/fines/:id
export const deleteFine = async (req, res) => {
  try {
    const fine = await Fine.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!fine) return res.status(404).json({ message: 'Amende introuvable.' });
    await AuditLog.create({ user: req.user._id, organizationId: req.organizationId, action: 'delete_fine', entity: 'Fine', entityId: fine._id });
    res.json({ message: 'Amende supprimée.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
