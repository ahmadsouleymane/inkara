import cron from 'node-cron';
import Loan from '../models/Loan.js';
import Notification from '../models/Notification.js';
import Organization from '../models/Organization.js';
import Event from '../models/Event.js';
import Fine from '../models/Fine.js';
import User from '../models/User.js';
import emailService from '../services/email.service.js';

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const hasNotifToday = async (userId, type) => {
  return Notification.findOne({ user: userId, type, createdAt: { $gte: todayStart() } });
};

const createNotif = async (userId, orgId, type, message) => {
  if (await hasNotifToday(userId, type)) return false;
  await Notification.create({ user: userId, organizationId: orgId, type, message });
  return true;
};

// ===== Vérification des emprunts =====
const checkLoans = async () => {
  try {
    const organizations = await Organization.find();
    const now = new Date();
    let stats = { checked: 0, dueSoon: 0, dueToday: 0, late: 0, fines: 0 };

    for (const org of organizations) {
      const activeLoans = await Loan.find({
        organizationId: org._id,
        status: 'borrowed',
      }).populate('book', 'title').populate('user', 'fullName email notificationPreferences');

      for (const loan of activeLoans) {
        const dueDate = new Date(loan.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const user = loan.user;
        const prefs = user.notificationPreferences || {};

        // En retard
        if (daysUntilDue < 0) {
          loan.status = 'late';
          await loan.save();
          const daysLate = Math.abs(daysUntilDue);

          if (prefs.overdueAlert !== false && prefs.inApp !== false) {
            const created = await createNotif(user._id, org._id, 'loan_late',
              `Le livre "${loan.book.title}" est en retard de ${daysLate} jour(s). Veuillez le retourner au plus vite.`);
            if (created) stats.late++;
          }

          if (prefs.overdueAlert !== false && prefs.email !== false) {
            await emailService.sendOverdueAlert(user, loan.book, loan.dueDate, daysLate, org.name);
          }

          // Auto-création d'amendes
          if (org.fineSettings?.enabled && daysLate > (org.fineSettings.gracePeriodDays || 3)) {
            const existingFine = await Fine.findOne({ loan: loan._id, organizationId: org._id });
            if (!existingFine) {
              const amount = Math.min(
                daysLate * (org.fineSettings.amountPerDay || 0.5),
                org.fineSettings.maxFine || 20
              );
              await Fine.create({
                user: user._id,
                loan: loan._id,
                book: loan.book._id,
                organizationId: org._id,
                amount,
                reason: `Retard de ${daysLate} jour(s)`,
              });
              stats.fines++;

              if (prefs.fineCreated !== false && prefs.email !== false) {
                await emailService.sendFineCreated(user, loan.book, amount, org.name);
              }
            }
          }
        }
        // Échéance aujourd'hui
        else if (daysUntilDue === 0) {
          if (prefs.dueSoonReminder !== false && prefs.inApp !== false) {
            const created = await createNotif(user._id, org._id, 'loan_due',
              `Le livre "${loan.book.title}" doit être retourné aujourd'hui.`);
            if (created) stats.dueToday++;
          }
          if (prefs.dueSoonReminder !== false && prefs.email !== false) {
            await emailService.sendDueToday(user, loan.book, org.name);
          }
        }
        // Rappel 3 jours avant
        else if (daysUntilDue <= 3 && daysUntilDue > 0) {
          if (prefs.dueSoonReminder !== false && prefs.inApp !== false) {
            const created = await createNotif(user._id, org._id, 'loan_due',
              `Le livre "${loan.book.title}" doit être retourné dans ${daysUntilDue} jour(s).`);
            if (created) stats.dueSoon++;
          }
          if (prefs.dueSoonReminder !== false && prefs.email !== false) {
            await emailService.sendDueSoonReminder(user, loan.book, loan.dueDate, org.name);
          }
        }
      }

      stats.checked += activeLoans.length;
    }

    console.log(`[Scheduler] Emprunts: ${stats.checked} vérifiés, ${stats.dueSoon} rappels, ${stats.dueToday} échéances, ${stats.late} retards, ${stats.fines} amendes`);
  } catch (error) {
    console.error('[Scheduler] Erreur emprunts:', error.message);
  }
};

// ===== Rappel événements (veille) =====
const checkEventReminders = async () => {
  try {
    const organizations = await Organization.find();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    let sent = 0;
    for (const org of organizations) {
      const events = await Event.find({
        organizationId: org._id,
        date: { $gte: tomorrow, $lte: tomorrowEnd },
      });

      for (const event of events) {
        // Notifier les inscrits (participants)
        const participants = event.registrations || [];
        for (const userId of participants) {
          const user = await User.findById(userId);
          if (!user || user.organizationId?.toString() !== org._id.toString()) continue;
          const prefs = user.notificationPreferences || {};

          if (prefs.eventReminder !== false && prefs.inApp !== false) {
            await createNotif(userId, org._id, 'event_reminder',
              `Rappel : l'événement "${event.title}" a lieu demain.`);
          }
          if (prefs.eventReminder !== false && prefs.email !== false) {
            await emailService.sendEventReminder(user, event, org.name);
          }
          sent++;
        }
      }
    }

    if (sent > 0) console.log(`[Scheduler] ${sent} rappel(s) d'événement envoyé(s)`);
  } catch (error) {
    console.error('[Scheduler] Erreur événements:', error.message);
  }
};

// ===== Démarrage =====
export const startScheduler = () => {
  // Emprunts: tous les jours à 9h00
  cron.schedule('0 9 * * *', () => {
    console.log('[Scheduler] Vérification des emprunts...');
    checkLoans();
  });

  // Événements: tous les jours à 18h00
  cron.schedule('0 18 * * *', () => {
    console.log('[Scheduler] Vérification des rappels événements...');
    checkEventReminders();
  });

  console.log('[Scheduler] Programmé — Emprunts: 9h00, Événements: 18h00');
};
