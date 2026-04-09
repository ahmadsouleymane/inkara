import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usersApi } from '../../api/users.js';
import { organizationApi } from '../../api/organization.js';
import Modal from '../../components/Modal.jsx';
import { Users as UsersIcon, Plus, Search, Trash2, UserPlus, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', phone: '', role: 'member' });
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '', role: 'member' });
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const isOwner = user?.role === 'owner' || user?.role === 'admin';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (isOwner) {
        // Owner uses organizationApi to get members
        const params = new URLSearchParams({ limit: 50 });
        if (search) params.set('search', search);
        if (roleFilter) params.set('role', roleFilter);
        const data = await organizationApi.getMembers(params.toString());
        setUsers(data.members);
      } else {
        const params = new URLSearchParams({ limit: 50 });
        if (search) params.set('search', search);
        if (roleFilter) params.set('role', roleFilter);
        const data = await usersApi.getAll(params.toString());
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await usersApi.create(newUser);
      toast.success('Utilisateur créé');
      setShowModal(false);
      setNewUser({ fullName: '', email: '', password: '', phone: '', role: 'member' });
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const result = await organizationApi.invite(inviteForm);
      setInviteResult(result);
      toast.success('Membre invité !');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(inviteResult.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      if (isOwner) {
        await organizationApi.updateMemberRole(userId, newRole);
      } else {
        await usersApi.updateRole(userId, newRole);
      }
      toast.success('Rôle mis à jour');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      if (isOwner) {
        await organizationApi.removeMember(userId);
      } else {
        await usersApi.delete(userId);
      }
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const roleLabel = (r) => {
    if (r === 'owner') return 'Propriétaire';
    if (r === 'admin') return 'Administrateur';
    if (r === 'librarian') return 'Bibliothécaire';
    return 'Membre';
  };

  const roleBadge = (r) => {
    if (r === 'owner') return 'badge-danger';
    if (r === 'admin') return 'badge-danger';
    if (r === 'librarian') return 'badge-warning';
    return 'badge-info';
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isOwner ? 'Membres' : 'Utilisateurs'}</h1>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button onClick={() => { setShowInviteModal(true); setInviteResult(null); }} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Inviter
            </button>
          )}
          {user?.role === 'superadmin' && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
            <input
              className="input pl-10"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="owner">Propriétaires</option>
            <option value="admin">Administrateurs</option>
            <option value="librarian">Bibliothécaires</option>
            <option value="member">Membres</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <UsersIcon className="w-16 h-16 text-[var(--color-text-light)] mx-auto mb-4 opacity-30" />
          <p className="text-[var(--color-text-light)]">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Nom</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Email</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Rôle</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Inscrit le</th>
                <th className="text-right py-3 font-medium text-[var(--color-text-light)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#DBEAFE] rounded-full flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                        {u.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 text-[var(--color-text-light)]">{u.email}</td>
                  <td className="py-3">
                    {u.role === 'owner' ? (
                      <span className={`badge ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-xs border border-[var(--color-border)] rounded px-2 py-1 bg-transparent cursor-pointer"
                      >
                        <option value="member">Membre</option>
                        <option value="librarian">Bibliothécaire</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    )}
                  </td>
                  <td className="py-3 text-[var(--color-text-light)]">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 text-right">
                    {u.role !== 'owner' && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-[var(--color-text-light)] hover:text-red-500 cursor-pointer bg-transparent border-none p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal invitation membre (owner) */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Inviter un membre">
        {inviteResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#DCFCE7] rounded-lg">
              <p className="font-medium text-[#166534] mb-2">Membre invité avec succès !</p>
              <p className="text-sm text-[#166534]">Communiquez le mot de passe temporaire au membre.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mot de passe temporaire</label>
              <div className="flex items-center gap-2">
                <input className="input font-mono" value={inviteResult.tempPassword} readOnly />
                <button onClick={handleCopyPassword} className="btn-secondary p-2.5 flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button onClick={() => { setShowInviteModal(false); setInviteResult(null); setInviteForm({ fullName: '', email: '', role: 'member' }); }} className="btn-primary w-full">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nom complet *</label>
              <input className="input" value={inviteForm.fullName} onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input type="email" className="input" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Rôle</label>
              <select className="input" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                <option value="member">Membre</option>
                <option value="librarian">Bibliothécaire</option>
              </select>
            </div>
            <p className="text-xs text-[var(--color-text-light)]">Un mot de passe temporaire sera généré automatiquement.</p>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">Inviter</button>
              <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal ajout direct (superadmin) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Ajouter un utilisateur">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nom complet *</label>
            <input className="input" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email *</label>
            <input type="email" className="input" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mot de passe *</label>
            <input type="password" className="input" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Téléphone</label>
            <input className="input" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Rôle</label>
            <select className="input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="member">Membre</option>
              <option value="librarian">Bibliothécaire</option>
              <option value="admin">Administrateur</option>
              <option value="owner">Propriétaire</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
