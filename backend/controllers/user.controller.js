import User from '../models/User.js';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/users — Liste de tous les utilisateurs (admin)
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.organizationId };

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users/:id — Détail d'un utilisateur
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/users/:id/role — Changement de rôle (admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ['member', 'librarian', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }

    // Empêcher un admin de promouvoir au-dessus de son propre rôle
    if (role === 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Seul un superadmin ou owner peut promouvoir au rôle admin.' });
    }

    // Empêcher la modification du rôle d'un owner/superadmin
    const targetUser = await User.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!targetUser) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    if (['owner', 'superadmin'].includes(targetUser.role)) {
      return res.status(403).json({ message: 'Impossible de modifier le rôle d\'un owner ou superadmin.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/:id — Suppression d'un utilisateur (admin)
export const deleteUser = async (req, res) => {
  try {
    // Empêcher la suppression de son propre compte
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const user = await User.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/users — Création d'un utilisateur par l'admin
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, department } = req.body;

    const existingUser = await User.findOne({ email, organizationId: req.organizationId });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: role || 'member',
      department,
      organizationId: req.organizationId,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
