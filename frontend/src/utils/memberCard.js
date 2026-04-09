const CARD_WIDTH = 1012;
const CARD_HEIGHT = 638;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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

export async function generateMemberCard(user, org, primaryColor = '#0114dc') {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, '#040848');
  gradient.addColorStop(1, primaryColor);
  roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 32);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.clip();

  // Cercles décoratifs
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(CARD_WIDTH - 100, 100, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, CARD_HEIGHT - 50, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Logo
  if (org?.logo) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';
      const logoSrc = org.logo.startsWith('http') ? org.logo : `${API_URL}${org.logo}`;
      const logo = await loadImage(logoSrc);
      const logoSize = 80;
      ctx.drawImage(logo, 50, 40, logoSize, logoSize);
    } catch {}
  }

  // Nom de l'organisation
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = 'bold 20px Inter, system-ui, sans-serif';
  ctx.fillText(org?.name || 'SmartLib', org?.logo ? 145 : 50, 85);

  // "CARTE MEMBRE"
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '600 14px Inter, system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('CARTE MEMBRE', 50, 170);

  // Nom du membre
  ctx.fillStyle = '#ffffff';
  const name = user.fullName || 'Membre';
  let fontSize = 48;
  if (name.length > 20) fontSize = 36;
  if (name.length > 30) fontSize = 28;
  ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.fillText(name, 50, 240);

  // Département / Rôle
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '400 22px Inter, system-ui, sans-serif';
  ctx.fillText(user.department || user.role || '', 50, 285);

  // Email
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '400 18px Inter, system-ui, sans-serif';
  ctx.fillText(user.email || '', 50, 325);

  // ID membre
  if (user.membershipId || user._id) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '400 14px monospace';
    ctx.fillText(`ID: ${user.membershipId || user._id}`, 50, 365);
  }

  // QR Code
  if (user.qrCode) {
    try {
      const qrImg = await loadImage(user.qrCode);
      const qrSize = 260;
      const qrX = CARD_WIDTH - qrSize - 50;
      const qrY = (CARD_HEIGHT - qrSize) / 2 - 20;

      // Fond blanc pour le QR
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, qrX - 15, qrY - 15, qrSize + 30, qrSize + 30, 16);
      ctx.fill();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {}
  }

  // Bandeau bas
  const bandHeight = 70;
  ctx.fillStyle = primaryColor;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(0, CARD_HEIGHT - bandHeight, CARD_WIDTH, bandHeight);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Inter, system-ui, sans-serif';
  ctx.fillText('BIBLIOTHÈQUE', 50, CARD_HEIGHT - 28);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '400 13px Inter, system-ui, sans-serif';
  ctx.fillText(org?.address || '', 50, CARD_HEIGHT - 10);

  // Date d'émission
  const date = new Date().toLocaleDateString('fr-FR');
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '400 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Émise le ${date}`, CARD_WIDTH - 50, CARD_HEIGHT - 28);
  ctx.textAlign = 'left';

  return canvas;
}

export async function downloadCard(user, org, primaryColor) {
  const canvas = await generateMemberCard(user, org, primaryColor);
  const link = document.createElement('a');
  link.download = `carte-membre-${user.fullName?.toLowerCase().replace(/\s+/g, '-') || 'membre'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function downloadAllCards(users, org, primaryColor) {
  for (const user of users) {
    await downloadCard(user, org, primaryColor);
    await new Promise(r => setTimeout(r, 200));
  }
}
