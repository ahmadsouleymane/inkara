import ReadingList from '../models/ReadingList.js';
import Organization from '../models/Organization.js';

// GET /api/reading-lists
export const getReadingLists = async (req, res) => {
  try {
    const lists = await ReadingList.find({ organizationId: req.organizationId })
      .populate('createdBy', 'fullName')
      .populate('books', 'title author cover')
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reading-lists/:id
export const getReadingList = async (req, res) => {
  try {
    const list = await ReadingList.findOne({ _id: req.params.id, organizationId: req.organizationId })
      .populate('createdBy', 'fullName')
      .populate('books', 'title author cover isbn category availableCopies');
    if (!list) return res.status(404).json({ message: 'Liste introuvable.' });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/reading-lists
export const createReadingList = async (req, res) => {
  try {
    const { title, description, books, isPublic } = req.body;
    const list = await ReadingList.create({
      organizationId: req.organizationId,
      title,
      description,
      books: books || [],
      isPublic: isPublic || false,
      createdBy: req.user._id,
    });
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/reading-lists/:id
export const updateReadingList = async (req, res) => {
  try {
    const { title, description, books, isPublic } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (books !== undefined) updates.books = books;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    const list = await ReadingList.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      updates,
      { new: true, runValidators: true }
    ).populate('books', 'title author cover');

    if (!list) return res.status(404).json({ message: 'Liste introuvable.' });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/reading-lists/:id
export const deleteReadingList = async (req, res) => {
  try {
    const list = await ReadingList.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!list) return res.status(404).json({ message: 'Liste introuvable.' });
    res.json({ message: 'Liste supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/reading-lists/:id/books/:bookId
export const addBookToList = async (req, res) => {
  try {
    const list = await ReadingList.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!list) return res.status(404).json({ message: 'Liste introuvable.' });

    if (list.books.includes(req.params.bookId)) {
      return res.status(400).json({ message: 'Livre déjà dans la liste.' });
    }

    list.books.push(req.params.bookId);
    await list.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/reading-lists/:id/books/:bookId
export const removeBookFromList = async (req, res) => {
  try {
    const list = await ReadingList.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!list) return res.status(404).json({ message: 'Liste introuvable.' });

    list.books = list.books.filter((id) => id.toString() !== req.params.bookId);
    await list.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organization/public/:slug/reading-lists (public)
export const getPublicReadingLists = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org) return res.status(404).json({ message: 'Organisation introuvable.' });

    const lists = await ReadingList.find({ organizationId: org._id, isPublic: true })
      .populate('books', 'title author cover availableCopies')
      .sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
