import whatsappService from '../services/whatsapp.service.js';

// POST /api/whatsapp/init — Initialiser la connexion WhatsApp
export const initWhatsApp = async (req, res) => {
  try {
    const result = await whatsappService.initialize(req.organizationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/whatsapp/status — Statut de la connexion
export const getWhatsAppStatus = async (req, res) => {
  try {
    const status = await whatsappService.getStatus(req.organizationId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/whatsapp/disconnect — Déconnecter WhatsApp
export const disconnectWhatsApp = async (req, res) => {
  try {
    await whatsappService.disconnect(req.organizationId);
    res.json({ message: 'WhatsApp déconnecté.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/whatsapp/send — Envoyer un message test
export const sendTestMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ message: 'Numéro et message requis.' });
    }
    const sent = await whatsappService.sendMessage(req.organizationId, phone, message);
    if (sent) {
      res.json({ message: 'Message envoyé.' });
    } else {
      res.status(400).json({ message: 'WhatsApp non connecté.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
