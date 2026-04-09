import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppService {
  constructor() {
    this.sessions = new Map(); // orgId -> { socket, status, qr }
  }

  getSessionPath(orgId) {
    return path.join(__dirname, '..', 'whatsapp-sessions', orgId.toString());
  }

  getStatus(orgId) {
    const session = this.sessions.get(orgId.toString());
    if (!session) return { connected: false, status: 'disconnected', qr: null };
    return { connected: session.status === 'connected', status: session.status, qr: session.qr || null };
  }

  async initialize(orgId) {
    const orgKey = orgId.toString();
    if (this.sessions.has(orgKey) && this.sessions.get(orgKey).status === 'connected') {
      return { status: 'already_connected' };
    }

    const sessionPath = this.getSessionPath(orgId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const session = { socket: null, status: 'connecting', qr: null };
    this.sessions.set(orgKey, session);

    const socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ['SmartLib', 'Chrome', '120.0'],
    });

    session.socket = socket;

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        session.qr = qr;
        session.status = 'qr_ready';
        console.log(`[WhatsApp] QR prêt pour org ${orgKey}`);
      }

      if (connection === 'open') {
        session.status = 'connected';
        session.qr = null;
        console.log(`[WhatsApp] Connecté pour org ${orgKey}`);
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          session.status = 'logged_out';
          session.qr = null;
          this.sessions.delete(orgKey);
          console.log(`[WhatsApp] Déconnecté (logged out) pour org ${orgKey}`);
        } else {
          session.status = 'disconnected';
          console.log(`[WhatsApp] Déconnecté pour org ${orgKey}, raison: ${reason}`);
        }
      }
    });

    return { status: 'initializing' };
  }

  async disconnect(orgId) {
    const orgKey = orgId.toString();
    const session = this.sessions.get(orgKey);
    if (!session?.socket) return;

    await session.socket.logout();
    this.sessions.delete(orgKey);
  }

  async sendMessage(orgId, phone, message) {
    const orgKey = orgId.toString();
    const session = this.sessions.get(orgKey);
    if (!session?.socket || session.status !== 'connected') {
      console.log(`[WhatsApp] Non connecté pour org ${orgKey}, message ignoré`);
      return false;
    }

    try {
      // Normaliser le numéro (enlever +, espaces, etc.)
      const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
      const jid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

      await session.socket.sendMessage(jid, { text: message });
      return true;
    } catch (error) {
      console.error(`[WhatsApp] Erreur envoi pour org ${orgKey}:`, error.message);
      return false;
    }
  }

  // Messages templates
  formatDueSoonMessage(userName, bookTitle, daysLeft, orgName) {
    return `📚 *${orgName}*\n\nBonjour ${userName},\n\nLe livre "${bookTitle}" doit être retourné dans *${daysLeft} jour(s)*.\n\nMerci de le rapporter à temps !`;
  }

  formatOverdueMessage(userName, bookTitle, daysLate, orgName) {
    return `⚠️ *${orgName}*\n\nBonjour ${userName},\n\nLe livre "${bookTitle}" est en retard de *${daysLate} jour(s)*.\n\nVeuillez le retourner au plus vite pour éviter des pénalités.`;
  }

  formatFineMessage(userName, bookTitle, amount, orgName) {
    return `💰 *${orgName}*\n\nBonjour ${userName},\n\nUne amende de *${amount}* a été créée pour le retard du livre "${bookTitle}".\n\nRendez-vous à la bibliothèque pour régulariser.`;
  }

  formatReservationAvailable(userName, bookTitle, orgName) {
    return `✅ *${orgName}*\n\nBonjour ${userName},\n\nLe livre "${bookTitle}" que vous aviez réservé est maintenant *disponible* !\n\nVenez le récupérer rapidement.`;
  }

  formatEventReminder(userName, eventTitle, orgName) {
    return `📅 *${orgName}*\n\nBonjour ${userName},\n\nRappel : l'événement "*${eventTitle}*" a lieu *demain* !\n\nNous vous attendons avec impatience.`;
  }

  formatBroadcast(subject, body, orgName) {
    return `📢 *${orgName}*\n\n*${subject}*\n\n${body}`;
  }

  formatWelcome(userName, orgName) {
    return `🎉 *Bienvenue à ${orgName}* !\n\nBonjour ${userName},\n\nVotre compte a été créé avec succès. Vous pouvez maintenant emprunter des livres et participer aux événements.\n\nBonne lecture ! 📖`;
  }
}

const whatsappService = new WhatsAppService();
export default whatsappService;
