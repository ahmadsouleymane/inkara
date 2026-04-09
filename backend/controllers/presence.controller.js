import Presence from '../models/Presence.js';

// POST /api/presence/checkin
export const checkIn = async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Presence.findOne({
      user: userId,
      organizationId: req.organizationId,
      checkIn: { $gte: today },
      checkOut: null,
    });

    if (existing) return res.status(400).json({ message: 'Cet utilisateur est déjà enregistré.' });

    const presence = await Presence.create({ user: userId, organizationId: req.organizationId, scannedBy: req.user._id });
    await presence.populate('user', 'fullName email');
    res.status(201).json(presence);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// PUT /api/presence/:id/checkout
export const checkOut = async (req, res) => {
  try {
    const presence = await Presence.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!presence) return res.status(404).json({ message: 'Enregistrement introuvable.' });
    if (presence.checkOut) return res.status(400).json({ message: 'Déjà sorti.' });

    presence.checkOut = new Date();
    await presence.save();
    await presence.populate('user', 'fullName email');
    res.json(presence);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/presence/today
export const getTodayPresence = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presences = await Presence.find({ organizationId: req.organizationId, checkIn: { $gte: today } })
      .populate('user', 'fullName email')
      .sort({ checkIn: -1 });
    res.json(presences);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/presence/history
export const getPresenceHistory = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const total = await Presence.countDocuments({ organizationId: req.organizationId });
    const presences = await Presence.find({ organizationId: req.organizationId })
      .populate('user', 'fullName email')
      .sort({ checkIn: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ presences, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
