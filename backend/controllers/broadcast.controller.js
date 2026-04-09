import User from '../models/User.js';
import Notification from '../models/Notification.js';
import emailService from '../services/email.service.js';
import Organization from '../models/Organization.js';

// POST /api/broadcast
export const sendBroadcast = async (req, res) => {
  try {
    const { subject, body, audience, sendEmail } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ message: 'Sujet et message requis.' });
    }

    const orgId = req.organizationId;
    const org = await Organization.findById(orgId);

    // Build audience filter
    const filter = { organizationId: orgId };
    if (audience === 'members') {
      filter.role = 'member';
    } else if (audience === 'staff') {
      filter.role = { $in: ['librarian', 'admin'] };
    }
    // 'all' = no extra filter

    const users = await User.find(filter).select('fullName email notificationPreferences');

    let inAppCount = 0;
    let emailCount = 0;

    for (const user of users) {
      const prefs = user.notificationPreferences || {};

      // In-app notification
      if (prefs.inApp !== false) {
        await Notification.create({
          user: user._id,
          organizationId: orgId,
          type: 'broadcast',
          message: `${subject}: ${body.substring(0, 200)}`,
        });
        inAppCount++;
      }

      // Email
      if (sendEmail && prefs.email !== false) {
        await emailService.sendBroadcast(user, subject, body, org?.name || 'SmartLib');
        emailCount++;
      }
    }

    res.json({
      message: `Message envoyé à ${users.length} membre(s).`,
      stats: { total: users.length, inApp: inAppCount, email: emailCount },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/broadcast/audience-count
export const getAudienceCount = async (req, res) => {
  try {
    const orgId = req.organizationId;
    const { audience } = req.query;

    const filter = { organizationId: orgId };
    if (audience === 'members') filter.role = 'member';
    else if (audience === 'staff') filter.role = { $in: ['librarian', 'admin'] };

    const count = await User.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
