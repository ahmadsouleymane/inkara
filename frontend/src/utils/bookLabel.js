/**
 * Génère et télécharge une étiquette livre (PNG) via Canvas API.
 * Style cohérent avec le thème SmartLib.
 */

const W = 400;
const H = 240;
const PRIMARY = '#0114dc';
const DARK = '#1a1a2e';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBarcode(ctx, isbn, x, y, barH) {
  const str = (isbn || '0000000000000').replace(/[^0-9]/g, '');
  let cx = x;
  for (let i = 0; i < str.length && cx < W - 16; i++) {
    const digit = parseInt(str[i]) || 1;
    const barW = (digit % 3) + 1;
    ctx.fillStyle = i % 2 === 0 ? DARK : '#ffffff';
    ctx.fillRect(cx, y, barW, barH);
    cx += barW + 1;
  }
  // ISBN text below barcode
  ctx.fillStyle = DARK;
  ctx.font = '10px monospace';
  ctx.fillText(isbn || '', x, y + barH + 12);
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + '…';
}

export function generateBookLabelCanvas(book) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // White background with rounded corners
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, 0, W, H, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 12);
  ctx.stroke();

  // Header bar
  ctx.save();
  roundRect(ctx, 0, 0, W, 40, 12);
  ctx.clip();
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(0, 0, W, 40);
  ctx.restore();
  // Flat bottom of header
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(0, 28, W, 12);

  // Header text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('BIBLIOTHÈQUE', 14, 26);

  // Location badge (top right)
  if (book.location) {
    ctx.font = 'bold 11px system-ui, sans-serif';
    const locText = book.location;
    const locW = ctx.measureText(locText).width + 16;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, W - locW - 10, 10, locW, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(locText, W - locW - 2, 26);
  }

  // ISBN + barcode
  ctx.fillStyle = DARK;
  ctx.font = 'bold 11px monospace';
  ctx.fillText('ISBN: ' + (book.isbn || '—'), 14, 64);
  drawBarcode(ctx, book.isbn, 14, 72, 32);

  // Title
  ctx.fillStyle = DARK;
  let fontSize = 15;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  const maxTitleW = W - 28;
  while (ctx.measureText(book.title || '—').width > maxTitleW && fontSize > 10) {
    fontSize--;
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  }
  ctx.fillText(truncateText(ctx, book.title || '—', maxTitleW), 14, 134);

  // Author
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px system-ui, sans-serif';
  const author = Array.isArray(book.author) ? book.author.join(', ') : (book.author || '—');
  ctx.fillText(truncateText(ctx, author, maxTitleW), 14, 154);

  // Category + condition badges
  const y = 178;
  if (book.category) {
    ctx.font = '10px system-ui, sans-serif';
    const catW = ctx.measureText(book.category).width + 12;
    ctx.fillStyle = 'rgba(1,20,220,0.12)';
    roundRect(ctx, 14, y - 11, catW, 18, 4);
    ctx.fill();
    ctx.fillStyle = PRIMARY;
    ctx.fillText(book.category, 20, y + 2);
  }

  // Bottom line
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(14, H - 32, W - 28, 1);

  // Footer: ID
  ctx.fillStyle = '#9ca3af';
  ctx.font = '9px monospace';
  ctx.fillText(`ID: ${book._id || ''}`, 14, H - 12);

  // Footer: date
  const date = new Date().toLocaleDateString('fr-FR');
  ctx.textAlign = 'right';
  ctx.fillText(date, W - 14, H - 12);
  ctx.textAlign = 'left';

  return canvas;
}

export function downloadBookLabel(book) {
  const canvas = generateBookLabelCanvas(book);
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `etiquette-${(book.isbn || book._id || 'livre').replace(/\s+/g, '-')}.png`;
  a.click();
}

export async function downloadAllLabels(books) {
  for (const book of books) {
    downloadBookLabel(book);
    await new Promise((r) => setTimeout(r, 200));
  }
}
