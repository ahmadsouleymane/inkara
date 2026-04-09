import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import userRoutes from './routes/user.routes.js';
import loanRoutes from './routes/loan.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import categoryRoutes from './routes/category.routes.js';
import libraryRoutes from './routes/library.routes.js';
import statsRoutes from './routes/stats.routes.js';
import fineRoutes from './routes/fine.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import auditRoutes from './routes/audit.routes.js';
import reviewRoutes from './routes/review.routes.js';
import eventRoutes from './routes/event.routes.js';
import presenceRoutes from './routes/presence.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import qrRoutes from './routes/qr.routes.js';
import selfcheckoutRoutes from './routes/selfcheckout.routes.js';
import lookupRoutes from './routes/lookup.routes.js';
import searchRoutes from './routes/search.routes.js';
import sitebuilderRoutes from './routes/sitebuilder.routes.js';
import readinglistRoutes from './routes/readinglist.routes.js';
import broadcastRoutes from './routes/broadcast.routes.js';
import planRoutes from './routes/plan.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import { startScheduler } from './utils/scheduler.js';
import { subdomainRouter } from './middleware/subdomain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérification du JWT_SECRET au démarrage
const UNSAFE_SECRETS = ['smartlib_secret_change_me_in_production', 'secret', 'changeme'];
if (!process.env.JWT_SECRET || UNSAFE_SECRETS.includes(process.env.JWT_SECRET)) {
  console.error('ERREUR FATALE : JWT_SECRET non défini ou non sécurisé. Définissez un secret fort dans .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 7080;

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(subdomainRouter);

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/selfcheckout', selfcheckoutRoutes);
app.use('/api/lookup', lookupRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sitebuilder', sitebuilderRoutes);
app.use('/api/reading-lists', readinglistRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/gamification', gamificationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartLib API' });
});

startScheduler();

app.listen(PORT, () => {
  console.log(`SmartLib API démarrée sur le port ${PORT}`);
});
