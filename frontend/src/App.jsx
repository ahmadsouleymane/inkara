import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import BookForm from './pages/BookForm.jsx';
import BookDetail from './pages/BookDetail.jsx';
import Loans from './pages/Loans.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import PublicSite from './pages/PublicSite.jsx';
import LibrarySite from './pages/LibrarySite.jsx';
import SiteConfig from './pages/SiteConfig.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Events from './pages/Events.jsx';

// Admin pages
import Users from './pages/admin/Users.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminReservations from './pages/admin/AdminReservations.jsx';
import AdminFines from './pages/admin/AdminFines.jsx';
import AdminPresence from './pages/admin/AdminPresence.jsx';
import AdminImport from './pages/admin/AdminImport.jsx';
import AdminAudit from './pages/admin/AdminAudit.jsx';

// QR / Self-checkout pages
import QRManager from './pages/admin/QRManager.jsx';
import InventoryScanner from './pages/admin/InventoryScanner.jsx';
import SelfCheckout from './pages/SelfCheckout.jsx';

// Analytics pages
import Analytics from './pages/admin/Analytics.jsx';
import ReportBuilder from './pages/admin/ReportBuilder.jsx';

// Site builder pages
import SiteBuilderPageList from './pages/admin/SiteBuilderPageList.jsx';
import SiteBuilder from './pages/admin/SiteBuilder.jsx';

// Notification preferences
import NotificationPreferences from './pages/NotificationPreferences.jsx';

// Reading lists
import ReadingLists from './pages/ReadingLists.jsx';
import ReadingListDetail from './pages/ReadingListDetail.jsx';

// Broadcast
import Broadcast from './pages/admin/Broadcast.jsx';

// Plan management
import PlanManager from './pages/admin/PlanManager.jsx';

// WhatsApp config
import WhatsAppConfig from './pages/admin/WhatsAppConfig.jsx';

// Mon QR / Carte membre
import MyQR from './pages/MyQR.jsx';

// Badges / Gamification
import Achievements from './pages/Achievements.jsx';

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';
import EmployeePresence from './pages/employee/EmployeePresence.jsx';
import EmployeeLoan from './pages/employee/EmployeeLoan.jsx';

const L = ({ children }) => <><Navbar />{children}</>;

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<PublicSite />} />
        <Route path="/lib/:slug" element={<LibrarySite />} />
        <Route path="/lib/:slug/:pageSlug" element={<LibrarySite />} />

        {/* Authentification */}
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Onboarding owner (protégé, tous rôles) */}
        <Route element={<PrivateRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        {/* Routes protégées — tous les rôles authentifiés */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<L><Dashboard /></L>} />
          <Route path="/livres" element={<L><Books /></L>} />
          <Route path="/livres/nouveau" element={<L><BookForm /></L>} />
          <Route path="/livres/:id/modifier" element={<L><BookForm /></L>} />
          <Route path="/livres/:id" element={<L><BookDetail /></L>} />
          <Route path="/emprunts" element={<L><Loans /></L>} />
          <Route path="/notifications" element={<L><Notifications /></L>} />
          <Route path="/profil" element={<L><Profile /></L>} />
          <Route path="/evenements" element={<L><Events /></L>} />
          <Route path="/notification-preferences" element={<L><NotificationPreferences /></L>} />
          <Route path="/reading-lists" element={<L><ReadingLists /></L>} />
          <Route path="/reading-lists/:id" element={<L><ReadingListDetail /></L>} />
          <Route path="/mon-qr" element={<MyQR />} />
          <Route path="/badges" element={<L><Achievements /></L>} />
        </Route>

        {/* Self-checkout (borne libre-service) — accessible à tous les authentifiés */}
        <Route element={<PrivateRoute />}>
          <Route path="/self-checkout" element={<SelfCheckout />} />
        </Route>

        {/* Routes employé (librarian) */}
        <Route element={<PrivateRoute roles={['librarian', 'admin', 'owner']} />}>
          <Route path="/employee/dashboard" element={<L><EmployeeDashboard /></L>} />
          <Route path="/employee/presence" element={<L><EmployeePresence /></L>} />
          <Route path="/employee/pret" element={<L><EmployeeLoan /></L>} />
          <Route path="/inventory" element={<L><InventoryScanner /></L>} />
        </Route>

        {/* Routes owner / admin */}
        <Route element={<PrivateRoute roles={['admin', 'owner']} />}>
          <Route path="/membres" element={<L><Users /></L>} />
          <Route path="/parametres" element={<L><Settings /></L>} />
          <Route path="/categories" element={<L><AdminCategories /></L>} />
          <Route path="/reservations" element={<L><AdminReservations /></L>} />
          <Route path="/amendes" element={<L><AdminFines /></L>} />
          <Route path="/admin/presence" element={<L><AdminPresence /></L>} />
          <Route path="/admin/import" element={<L><AdminImport /></L>} />
          <Route path="/qr-manager" element={<L><QRManager /></L>} />
          <Route path="/analytics" element={<L><Analytics /></L>} />
          <Route path="/reports" element={<L><ReportBuilder /></L>} />
          <Route path="/site-config" element={<L><SiteConfig /></L>} />
          <Route path="/site-builder" element={<L><SiteBuilderPageList /></L>} />
          <Route path="/site-builder/:slug" element={<SiteBuilder />} />
          <Route path="/broadcast" element={<L><Broadcast /></L>} />
          <Route path="/plan" element={<L><PlanManager /></L>} />
          <Route path="/whatsapp" element={<L><WhatsAppConfig /></L>} />
        </Route>

        {/* Routes super admin */}
        <Route element={<PrivateRoute roles={['superadmin']} />}>
          <Route path="/superadmin" element={<L><SuperAdminDashboard /></L>} />
          <Route path="/superadmin/organizations" element={<L><SuperAdminDashboard /></L>} />
          <Route path="/superadmin/users" element={<L><Users /></L>} />
          <Route path="/superadmin/audit" element={<L><AdminAudit /></L>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
