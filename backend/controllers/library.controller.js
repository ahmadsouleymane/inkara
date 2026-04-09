import Organization from '../models/Organization.js';

// GET /api/library — Récupérer les paramètres de la bibliothèque (redirige vers Organization)
export const getLibrary = async (req, res) => {
  try {
    const org = await Organization.findById(req.organizationId).populate('featuredBook');
    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    // Retourner un format compatible avec l'ancien modèle Library
    res.json({
      _id: org._id,
      name: org.name,
      logo: org.logo,
      description: org.description,
      address: org.address,
      phone: org.phone,
      email: org.email,
      website: org.website,
      openingHours: org.openingHours,
      maxLoansPerUser: org.loanSettings?.maxLoansPerUser || 3,
      loanDurationDays: org.loanSettings?.loanDurationDays || 14,
      featuredBook: org.featuredBook,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/library — Mettre à jour les paramètres de la bibliothèque (redirige vers Organization)
export const updateLibrary = async (req, res) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organisation introuvable.' });
    }

    const { name, description, address, phone, email, website, openingHours, maxLoansPerUser, loanDurationDays, featuredBook } = req.body;

    if (name !== undefined) org.name = name;
    if (description !== undefined) org.description = description;
    if (address !== undefined) org.address = address;
    if (phone !== undefined) org.phone = phone;
    if (email !== undefined) org.email = email;
    if (website !== undefined) org.website = website;
    if (openingHours !== undefined) org.openingHours = openingHours;
    if (!org.loanSettings) org.loanSettings = {};
    if (maxLoansPerUser !== undefined) org.loanSettings.maxLoansPerUser = maxLoansPerUser;
    if (loanDurationDays !== undefined) org.loanSettings.loanDurationDays = loanDurationDays;
    if (featuredBook !== undefined) org.featuredBook = featuredBook;

    if (req.file) {
      org.logo = `/uploads/${req.file.filename}`;
    }

    await org.save();

    res.json({
      _id: org._id,
      name: org.name,
      logo: org.logo,
      description: org.description,
      address: org.address,
      phone: org.phone,
      email: org.email,
      website: org.website,
      openingHours: org.openingHours,
      maxLoansPerUser: org.loanSettings?.maxLoansPerUser || 3,
      loanDurationDays: org.loanSettings?.loanDurationDays || 14,
      featuredBook: org.featuredBook,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
