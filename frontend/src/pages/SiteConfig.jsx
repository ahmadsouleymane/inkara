import { useState, useEffect } from 'react';
import { organizationApi } from '../api/organization.js';
import { Globe, Save, ExternalLink, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SiteConfig() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', address: '', phone: '', email: '',
    website: '', openingHours: '', primaryColor: '#0114dc', welcomeText: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  useEffect(() => {
    organizationApi.getMine().then((o) => {
      setOrg(o);
      setForm({
        name: o.name || '', slug: o.slug || '', description: o.description || '',
        address: o.address || '', phone: o.phone || '', email: o.email || '',
        website: o.website || '', openingHours: o.openingHours || '',
        primaryColor: o.siteConfig?.primaryColor || '#0114dc',
        welcomeText: o.siteConfig?.welcomeText || '',
      });
    }).catch(() => toast.error('Erreur chargement')).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'primaryColor' || k === 'welcomeText') return;
        fd.append(k, v);
      });
      fd.append('siteConfig', JSON.stringify({ primaryColor: form.primaryColor, welcomeText: form.welcomeText }));
      if (logoFile) fd.append('logo', logoFile);
      const updated = await organizationApi.update(fd);
      setOrg(updated);
      toast.success('Enregistré');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handlePublishToggle = async () => {
    try {
      if (org.isPublished) {
        const updated = await organizationApi.unpublish();
        setOrg(updated);
        toast.success('Site dépublié');
      } else {
        const updated = await organizationApi.publish();
        setOrg(updated);
        toast.success('Site publié !');
      }
    } catch (err) {
      if (err.requiresUpgrade) {
        toast.error('Passez au plan Pro pour publier votre site');
      } else { toast.error(err.message); }
    }
  };

  if (loading) return <div className="lg:ml-64 pt-20 lg:pt-8 p-6"><div className="skeleton h-96 rounded-xl" /></div>;

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Configuration du site</h1>
          <p className="text-sm text-[var(--color-text-light)]">Personnalisez le site public de votre bibliothèque</p>
        </div>
        <div className="flex items-center gap-3">
          {org?.isPublished ? (
            <>
              <span className="badge badge-success">Publié</span>
              <a href={`/lib/${org.slug}`} target="_blank" className="text-sm text-[var(--color-primary)] no-underline flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> Voir le site
              </a>
            </>
          ) : (
            <span className="badge badge-warning">Non publié</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de la bibliothèque</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL du site</label>
              <div className="flex items-center">
                <span className="text-sm text-[var(--color-text-light)] mr-2">smartlib.app/lib/</span>
                <input className="input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div><label className="block text-sm font-medium mb-1">Adresse</label><input className="input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Téléphone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><label className="block text-sm font-medium mb-1">Site web</label><input className="input" value={form.website} onChange={e => setForm({...form, website: e.target.value})} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Horaires d'ouverture</label><input className="input" value={form.openingHours} onChange={e => setForm({...form, openingHours: e.target.value})} /></div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Personnalisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Logo</label>
              <div className="flex items-center gap-4">
                {org?.logo && <img src={org.logo.startsWith('http') ? org.logo : `${API_URL}${org.logo}`} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />}
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Couleur primaire</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-none" />
                <span className="text-sm text-[var(--color-text-light)]">{form.primaryColor}</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Texte d'accueil</label>
              <textarea className="input" rows={3} placeholder="Bienvenue dans notre bibliothèque..." value={form.welcomeText} onChange={e => setForm({...form, welcomeText: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="card">
        <h2 className="font-semibold mb-4">Publication</h2>
        {org?.plan === 'free' ? (
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(242,140,78,0.1)' }}>
            <div>
              <p className="font-medium">Passez au plan Pro pour publier votre site</p>
              <p className="text-sm text-[var(--color-text-light)]">Le plan gratuit ne permet pas de publier le site public.</p>
            </div>
            <button className="btn-primary" onClick={() => toast('Contactez l\'administrateur pour passer au plan Pro')}>
              Mettre à niveau
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{org?.isPublished ? 'Votre site est en ligne' : 'Votre site est hors ligne'}</p>
              <p className="text-sm text-[var(--color-text-light)]">
                {org?.isPublished ? `Accessible à /lib/${org?.slug}` : 'Cliquez pour publier votre site'}
              </p>
            </div>
            <button onClick={handlePublishToggle} className={org?.isPublished ? 'btn-danger' : 'btn-primary'}>
              {org?.isPublished ? 'Dépublier' : 'Publier mon site'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
