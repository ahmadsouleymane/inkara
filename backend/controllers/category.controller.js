import Category from '../models/Category.js';

// GET /api/categories — Liste des catégories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ organizationId: req.organizationId }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/categories — Ajouter une catégorie
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' }, organizationId: req.organizationId });
    if (existing) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà.' });
    }

    const category = await Category.create({ name, organizationId: req.organizationId });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/categories/:id — Modifier une catégorie
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { name: req.body.name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Catégorie introuvable.' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/categories/:id — Supprimer une catégorie
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!category) {
      return res.status(404).json({ message: 'Catégorie introuvable.' });
    }
    res.json({ message: 'Catégorie supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
