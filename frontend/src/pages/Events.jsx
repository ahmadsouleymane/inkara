import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { eventsApi } from '../api/events.js';
import Modal from '../components/Modal.jsx';
import { Calendar, MapPin, Plus, Trash2, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '' });
  const [posterFile, setPosterFile] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  useEffect(() => {
    eventsApi.getAll().then(setEvents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (posterFile) formData.append('poster', posterFile);

    try {
      const event = await eventsApi.create(formData);
      setEvents([event, ...events]);
      setShowModal(false);
      setForm({ title: '', date: '', location: '', description: '' });
      setPosterFile(null);
      toast.success('Événement créé');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try {
      await eventsApi.delete(id);
      setEvents(events.filter(e => e._id !== id));
      toast.success('Événement supprimé');
    } catch (err) { toast.error(err.message); }
  };

  const handleRegister = async (id) => {
    try {
      await eventsApi.register(id);
      toast.success('Inscription réussie');
      eventsApi.getAll().then(setEvents);
    } catch (err) { toast.error(err.message); }
  };

  const handleUnregister = async (id) => {
    try {
      await eventsApi.unregister(id);
      toast.success('Désinscription réussie');
      eventsApi.getAll().then(setEvents);
    } catch (err) { toast.error(err.message); }
  };

  const isRegistered = (event) => event.registrations?.includes(user?._id);

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Événements</h1>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Créer
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-64 rounded-xl" />)}</div>
      ) : events.length === 0 ? (
        <p className="text-center text-[var(--color-text-light)] py-20">Aucun événement</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(event => (
            <div key={event._id} className="card overflow-hidden p-0">
              {event.poster && (
                <div className="h-48 overflow-hidden">
                  <img src={event.poster.startsWith('http') ? event.poster : `${API_URL}${event.poster}`} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-[var(--color-text-light)] mb-3">{event.description}</p>
                <div className="flex items-center gap-4 text-xs text-[var(--color-text-light)] mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString('fr-FR')}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
                  <span>{event.registrations?.length || 0} inscrit(s)</span>
                </div>
                <div className="flex gap-2">
                  {isRegistered(event) ? (
                    <button onClick={() => handleUnregister(event._id)} className="btn-secondary text-sm flex items-center gap-1.5">
                      <UserMinus className="w-4 h-4" /> Se désinscrire
                    </button>
                  ) : (
                    <button onClick={() => handleRegister(event._id)} className="btn-primary text-sm flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" /> S'inscrire
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(event._id)} className="btn-danger text-sm p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvel événement">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Titre *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Date *</label>
            <input type="datetime-local" className="input" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Lieu *</label>
            <input className="input" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Affiche *</label>
            <input type="file" accept="image/*" className="input" onChange={(e) => setPosterFile(e.target.files[0])} required />
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
