import Event from '../models/Event.js';

// GET /api/events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizationId: req.organizationId }).populate('createdBy', 'fullName').sort({ date: -1 });
    res.json(events);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// POST /api/events
export const addEvent = async (req, res) => {
  try {
    const { title, date, location, description } = req.body;
    const poster = req.file ? `/uploads/${req.file.filename}` : '';
    if (!poster) return res.status(400).json({ message: "L'affiche est requise." });

    const event = await Event.create({ title, date, location, description, poster, createdBy: req.user._id, organizationId: req.organizationId });
    res.status(201).json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizationId: req.organizationId });
    if (!event) return res.status(404).json({ message: 'Événement introuvable.' });
    res.json({ message: 'Événement supprimé.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// POST /api/events/:id/register
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!event) return res.status(404).json({ message: 'Événement introuvable.' });

    if (event.registrations.includes(req.user._id)) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit.' });
    }

    event.registrations.push(req.user._id);
    await event.save();
    res.json({ message: 'Inscription réussie.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// DELETE /api/events/:id/register
export const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!event) return res.status(404).json({ message: 'Événement introuvable.' });

    event.registrations = event.registrations.filter(id => id.toString() !== req.user._id.toString());
    await event.save();
    res.json({ message: 'Désinscription réussie.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// GET /api/events/:id/registrations
export const getRegistrations = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizationId: req.organizationId }).populate('registrations', 'fullName email');
    if (!event) return res.status(404).json({ message: 'Événement introuvable.' });
    res.json(event.registrations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
