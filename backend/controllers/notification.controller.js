import Notification from '../models/Notification.js';

// GET /api/notifications — Notifications de l'utilisateur connecté
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id, organizationId: req.organizationId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/:id/read — Marquer une notification comme lue
export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, organizationId: req.organizationId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable.' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notifications/read-all — Marquer toutes les notifications comme lues
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, organizationId: req.organizationId, read: false },
      { read: true }
    );

    res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
