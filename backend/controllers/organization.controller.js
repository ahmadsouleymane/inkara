import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Event from '../models/Event.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

// GET /api/organization — Récupérer mon organisation
export const getMyOrganization = async (req, res) => {
  try {
    const org = await Organization.findOne({
      $or: [
        { owner: req.user._id },
        { _id: req.user.organizationId },
      ],
    }).populate('featuredBook');

    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/organization — Mettre à jour l'organisation
export const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findOne({
      $or: [
        { owner: req.user._id },
        { _id: req.user.organizationId },
      ],
    });

    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    if (org.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Seul le propriétaire peut modifier l\'organisation.' });
    }

    const {
      name,
      description,
      address,
      phone,
      email,
      website,
      openingHours,
      siteConfig,
      loanSettings,
      slug,
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (website !== undefined) updates.website = website;
    if (openingHours !== undefined) updates.openingHours = openingHours;
    if (siteConfig !== undefined) updates.siteConfig = siteConfig;
    if (loanSettings !== undefined) updates.loanSettings = loanSettings;
    if (slug !== undefined) updates.slug = slug;

    if (req.file) {
      updates.logo = `/uploads/${req.file.filename}`;
    }

    const updated = await Organization.findByIdAndUpdate(org._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/organization/publish — Publier le site
export const publishSite = async (req, res) => {
  try {
    const org = await Organization.findOne({
      $or: [
        { owner: req.user._id },
        { _id: req.user.organizationId },
      ],
    });

    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    if (org.plan === 'free' || !org.planExpiresAt || org.planExpiresAt <= Date.now()) {
      return res.status(403).json({
        message: 'Abonnement requis pour publier votre site.',
        requiresUpgrade: true,
      });
    }

    org.isPublished = true;
    await org.save();

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/organization/unpublish — Dépublier le site
export const unpublishSite = async (req, res) => {
  try {
    const org = await Organization.findOne({
      $or: [
        { owner: req.user._id },
        { _id: req.user.organizationId },
      ],
    });

    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    org.isPublished = false;
    await org.save();

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/organization/invite — Inviter un membre
export const inviteMember = async (req, res) => {
  try {
    const org = await Organization.findOne({
      $or: [
        { owner: req.user._id },
        { _id: req.user.organizationId },
      ],
    });

    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    const { email, fullName, role = 'member' } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ message: 'Email et nom complet requis.' });
    }

    if (!['member', 'librarian'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Utilisez "member" ou "librarian".' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');

    const user = await User.create({
      fullName,
      email,
      password: tempPassword,
      role,
      organizationId: org._id,
    });

    // Générer le QR code pour le membre
    const qrData = JSON.stringify({ userId: user._id, orgId: org._id });
    const qrCode = await QRCode.toDataURL(qrData);
    user.qrCode = qrCode;
    await user.save();

    res.status(201).json({ user, tempPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organization/members — Lister les membres
export const getMembers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = {
      organizationId: req.organizationId,
      role: { $nin: ['owner', 'superadmin'] },
    };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const members = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      members,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/organization/members/:userId/role — Changer le rôle d'un membre
export const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['member', 'librarian'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Utilisez "member" ou "librarian".' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, organizationId: req.user.organizationId },
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Membre introuvable.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/organization/members/:userId — Retirer un membre
export const removeMember = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, organizationId: req.user.organizationId },
      { organizationId: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Membre introuvable.' });
    }

    res.json({ message: 'Membre retiré avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organization/public/:slug — Site public (pas d'auth)
export const getPublicSite = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });

    if (!org || !org.isPublished) {
      return res.status(404).json({ message: 'Site introuvable.' });
    }

    res.json({
      name: org.name,
      logo: org.logo,
      description: org.description,
      address: org.address,
      phone: org.phone,
      email: org.email,
      website: org.website,
      openingHours: org.openingHours,
      siteConfig: org.siteConfig,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organization/public/:slug/books — Livres publics d'une biblio
export const getPublicBooks = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org || !org.isPublished) {
      return res.status(404).json({ message: 'Site introuvable.' });
    }

    const { search, category, page = 1, limit = 12 } = req.query;
    const query = { organizationId: org._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .select('title author category cover copies availableCopies isbn year')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ books, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organization/public/:slug/events — Événements publics d'une biblio
export const getPublicEvents = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org || !org.isPublished) {
      return res.status(404).json({ message: 'Site introuvable.' });
    }

    const events = await Event.find({
      organizationId: org._id,
      date: { $gte: new Date() },
    })
      .sort({ date: 1 })
      .limit(6);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
