const escapeHtml = (text) => {
  if (!text) return '';
  const str = String(text);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
};

const e = escapeHtml;

const baseLayout = (content, orgName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; color: #1a1a1a; }
    .container { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 20px; margin: 0; }
    .content { font-size: 15px; line-height: 1.6; }
    .btn { display: inline-block; padding: 12px 24px; background: #4CAF7D; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 24px; }
    .highlight { background: #f0faf4; border-radius: 8px; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>${orgName || 'SmartLib'}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
    </div>
    <div class="footer">
      <p>Envoyé par ${orgName || 'SmartLib'} via SmartLib</p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  // Rappel 3 jours avant échéance
  dueSoonReminder: ({ userName, bookTitle, dueDate, orgName }) => ({
    subject: `Rappel : "${bookTitle}" à rendre bientôt`,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      <p>Nous vous rappelons que votre emprunt arrive bientôt à échéance :</p>
      <div class="highlight">
        <strong>${e(bookTitle)}</strong><br>
        Date de retour : <strong>${e(dueDate)}</strong>
      </div>
      <p>Pensez à retourner le livre à temps pour éviter les pénalités.</p>
    `, orgName),
  }),

  dueToday: ({ userName, bookTitle, orgName }) => ({
    subject: `Retour aujourd'hui : "${bookTitle}"`,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      <p>Votre emprunt arrive à échéance <strong>aujourd'hui</strong> :</p>
      <div class="highlight">
        <strong>${e(bookTitle)}</strong>
      </div>
      <p>Merci de le retourner dès que possible.</p>
    `, orgName),
  }),

  overdueAlert: ({ userName, bookTitle, dueDate, daysLate, orgName }) => ({
    subject: `Retard : "${bookTitle}" — ${daysLate} jour(s)`,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      <p>Vous avez un emprunt en retard :</p>
      <div class="highlight">
        <strong>${e(bookTitle)}</strong><br>
        Date de retour prévue : ${e(dueDate)}<br>
        Retard : <strong>${daysLate} jour(s)</strong>
      </div>
      <p>Des pénalités peuvent s'appliquer. Merci de retourner le livre rapidement.</p>
    `, orgName),
  }),

  reservationAvailable: ({ userName, bookTitle, orgName }) => ({
    subject: `"${bookTitle}" est disponible !`,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      <p>Le livre que vous avez réservé est maintenant disponible :</p>
      <div class="highlight">
        <strong>${e(bookTitle)}</strong>
      </div>
      <p>Venez le récupérer dans les meilleurs délais.</p>
    `, orgName),
  }),

  fineCreated: ({ userName, bookTitle, amount, orgName }) => ({
    subject: `Amende : ${amount} € — "${bookTitle}"`,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      <p>Une amende a été créée sur votre compte :</p>
      <div class="highlight">
        <strong>${e(bookTitle)}</strong><br>
        Montant : <strong>${amount} €</strong>
      </div>
      <p>Contactez la bibliothèque pour plus d'informations.</p>
    `, orgName),
  }),

  eventReminder: ({ userName, eventTitle, eventDate, eventLocation, orgName }) => ({
    subject: `Rappel : "${eventTitle}" demain`,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      <p>N'oubliez pas l'événement de demain :</p>
      <div class="highlight">
        <strong>${e(eventTitle)}</strong><br>
        Date : ${e(eventDate)}<br>
        ${eventLocation ? `Lieu : ${e(eventLocation)}` : ''}
      </div>
      <p>À demain !</p>
    `, orgName),
  }),

  newBooksDigest: ({ userName, books, orgName }) => ({
    subject: `Nouveautés de la semaine — ${orgName}`,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      <p>Voici les nouveaux livres ajoutés cette semaine :</p>
      <div class="highlight">
        ${books.map((b) => `<p style="margin:4px 0"><strong>${e(b.title)}</strong> — ${e(b.author)}</p>`).join('')}
      </div>
      <p>Bonne lecture !</p>
    `, orgName),
  }),

  broadcast: ({ userName, subject, body, orgName }) => ({
    subject,
    html: baseLayout(`
      <p>Bonjour ${e(userName)},</p>
      ${body}
    `, orgName),
  }),
};
