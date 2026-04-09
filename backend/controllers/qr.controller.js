import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import Book from '../models/Book.js';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// POST /api/qr/book/:bookId — Générer le QR d'un livre
export const generateBookQR = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });

    const qrData = `${BASE_URL}/scan/book/${book._id}`;
    const qrImage = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

    book.qrCode = qrImage;
    book.qrCodeData = qrData;
    await book.save();

    res.json({ qrCode: qrImage, qrCodeData: qrData, book: { _id: book._id, title: book.title } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/qr/books/batch — Générer les QR pour plusieurs livres
export const generateBatchQR = async (req, res) => {
  try {
    const { bookIds } = req.body;
    if (!bookIds || !bookIds.length) {
      return res.status(400).json({ message: 'Liste de livres requise.' });
    }

    const books = await Book.find({ _id: { $in: bookIds }, organizationId: req.organizationId });
    const results = [];

    for (const book of books) {
      const qrData = `${BASE_URL}/scan/book/${book._id}`;
      const qrImage = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

      book.qrCode = qrImage;
      book.qrCodeData = qrData;
      await book.save();

      results.push({ _id: book._id, title: book.title, qrCode: qrImage, qrCodeData: qrData });
    }

    res.json({ generated: results.length, books: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/qr/books/pdf — Générer une planche PDF d'étiquettes QR (format Avery 30/page)
export const generateQRLabelsPdf = async (req, res) => {
  try {
    const { bookIds } = req.query;
    const filter = { organizationId: req.organizationId, qrCode: { $ne: '' } };

    if (bookIds) {
      filter._id = { $in: bookIds.split(',') };
    }

    const books = await Book.find(filter).sort({ title: 1 });
    if (!books.length) {
      return res.status(400).json({ message: 'Aucun livre avec QR code trouvé.' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 20 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=qr-labels.pdf');
    doc.pipe(res);

    // Grille 5 colonnes x 6 lignes = 30 étiquettes par page
    const cols = 5;
    const rows = 6;
    const cellWidth = (doc.page.width - 40) / cols;
    const cellHeight = (doc.page.height - 40) / rows;
    const qrSize = Math.min(cellWidth - 10, cellHeight - 25);

    books.forEach((book, i) => {
      if (i > 0 && i % (cols * rows) === 0) doc.addPage();

      const pageIndex = i % (cols * rows);
      const col = pageIndex % cols;
      const row = Math.floor(pageIndex / cols);
      const x = 20 + col * cellWidth;
      const y = 20 + row * cellHeight;

      // QR code image
      if (book.qrCode) {
        const imgData = book.qrCode.replace(/^data:image\/png;base64,/, '');
        doc.image(Buffer.from(imgData, 'base64'), x + (cellWidth - qrSize) / 2, y, {
          width: qrSize,
          height: qrSize,
        });
      }

      // Titre tronqué sous le QR
      const label = book.title.length > 18 ? book.title.substring(0, 16) + '...' : book.title;
      doc.fontSize(6).text(label, x, y + qrSize + 2, { width: cellWidth, align: 'center' });
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/qr/scan/book/:bookId — Récupérer les infos d'un livre scanné
export const scanBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.bookId, organizationId: req.organizationId });
    if (!book) return res.status(404).json({ message: 'Livre introuvable.' });

    res.json({
      _id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      cover: book.cover,
      category: book.category,
      copies: book.copies,
      availableCopies: book.availableCopies,
      condition: book.condition,
      organizationId: book.organizationId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/qr/books/generate-all — Générer les QR pour tous les livres sans QR
export const generateAllMissingQR = async (req, res) => {
  try {
    const books = await Book.find({ organizationId: req.organizationId, $or: [{ qrCode: '' }, { qrCode: { $exists: false } }] });
    let count = 0;

    for (const book of books) {
      const qrData = `${BASE_URL}/scan/book/${book._id}`;
      const qrImage = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

      book.qrCode = qrImage;
      book.qrCodeData = qrData;
      await book.save();
      count++;
    }

    res.json({ message: `${count} QR codes générés.`, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
