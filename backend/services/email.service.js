import transporter, { emailConfig } from '../config/email.js';
import { emailTemplates } from './email.templates.js';

class EmailService {
  async send({ to, subject, html }) {
    if (!emailConfig.enabled) {
      console.log(`[Email] Skipped (not configured): "${subject}" → ${to}`);
      return null;
    }

    try {
      const result = await transporter.sendMail({
        from: emailConfig.from,
        to,
        subject,
        html,
      });
      console.log(`[Email] Sent: "${subject}" → ${to}`);
      return result;
    } catch (error) {
      console.error(`[Email] Error sending to ${to}:`, error.message);
      return null;
    }
  }

  async sendDueSoonReminder(user, book, dueDate, orgName) {
    const { subject, html } = emailTemplates.dueSoonReminder({
      userName: user.fullName,
      bookTitle: book.title,
      dueDate: new Date(dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }

  async sendDueToday(user, book, orgName) {
    const { subject, html } = emailTemplates.dueToday({
      userName: user.fullName,
      bookTitle: book.title,
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }

  async sendOverdueAlert(user, book, dueDate, daysLate, orgName) {
    const { subject, html } = emailTemplates.overdueAlert({
      userName: user.fullName,
      bookTitle: book.title,
      dueDate: new Date(dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      daysLate,
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }

  async sendReservationAvailable(user, book, orgName) {
    const { subject, html } = emailTemplates.reservationAvailable({
      userName: user.fullName,
      bookTitle: book.title,
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }

  async sendFineCreated(user, book, amount, orgName) {
    const { subject, html } = emailTemplates.fineCreated({
      userName: user.fullName,
      bookTitle: book.title,
      amount,
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }

  async sendEventReminder(user, event, orgName) {
    const { subject, html } = emailTemplates.eventReminder({
      userName: user.fullName,
      eventTitle: event.title,
      eventDate: new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      eventLocation: event.location,
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }

  async sendNewBooksDigest(user, books, orgName) {
    const { subject, html } = emailTemplates.newBooksDigest({
      userName: user.fullName,
      books: books.map((b) => ({ title: b.title, author: Array.isArray(b.author) ? b.author.join(', ') : b.author })),
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }

  async sendBroadcast(user, msgSubject, body, orgName) {
    const { subject, html } = emailTemplates.broadcast({
      userName: user.fullName,
      subject: msgSubject,
      body,
      orgName,
    });
    return this.send({ to: user.email, subject, html });
  }
}

export default new EmailService();
