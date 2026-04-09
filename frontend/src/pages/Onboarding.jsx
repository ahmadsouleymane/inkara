import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizationApi } from '../api/organization.js';
import { booksApi } from '../api/books.js';
import { Library, MapPin, BookOpen, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  { title: 'Informations', icon: MapPin },
  { title: 'Personnalisation', icon: Library },
  { title: 'Premier livre', icon: BookOpen },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ description: '', address: '', phone: '', email: '', openingHours: '' });
  const [site, setSite] = useState({ primaryColor: '#0114dc', welcomeText: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [book, setBook] = useState({ title: '', author: '', isbn: '', category: '', copies: 1 });

  const handleStep1 = async () => {
    setSaving(true);
    try {
      await organizationApi.update(info);
      setStep(2);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleStep2 = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('siteConfig', JSON.stringify(site));
      if (logoFile) fd.append('logo', logoFile);
      await organizationApi.update(fd);
      setStep(3);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleStep3 = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', book.title);
      fd.append('author', JSON.stringify([book.author]));
      fd.append('isbn', book.isbn);
      fd.append('category', book.category);
      fd.append('copies', book.copies);
      fd.append('availableCopies', book.copies);
      await booksApi.create(fd);
      toast.success('Bienvenue sur SmartLib !');
      navigate('/dashboard');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-2xl">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1 ? 'bg-[var(--color-primary)] text-white' :
                step === i + 1 ? 'bg-[var(--color-primary)] text-white' :
                'bg-[var(--color-border)] text-[var(--color-text-light)]'
              }`}>
                {step > i + 1 ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${step === i + 1 ? 'font-semibold' : 'text-[var(--color-text-light)]'}`}>
                {s.title}
              </span>
              {i < 2 && <div className={`w-12 h-0.5 ${step > i + 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-1">Parlez-nous de votre bibliothèque</h2>
              <p className="text-sm text-[var(--color-text-light)] mb-6">Ces informations apparaîtront sur votre site public.</p>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea className="input" rows={3} value={info.description} onChange={e => setInfo({...info, description: e.target.value})} placeholder="Décrivez votre bibliothèque..." /></div>
                <div><label className="block text-sm font-medium mb-1">Adresse</label><input className="input" value={info.address} onChange={e => setInfo({...info, address: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Téléphone</label><input className="input" value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input className="input" value={info.email} onChange={e => setInfo({...info, email: e.target.value})} /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Horaires</label><input className="input" value={info.openingHours} onChange={e => setInfo({...info, openingHours: e.target.value})} placeholder="Lun-Ven: 8h-18h" /></div>
              </div>
              <button onClick={handleStep1} className="btn-primary w-full mt-6 flex items-center justify-center gap-2" disabled={saving}>
                {saving ? 'Enregistrement...' : <><span>Suivant</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-1">Personnalisez votre site</h2>
              <p className="text-sm text-[var(--color-text-light)] mb-6">Donnez une identité visuelle à votre bibliothèque.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo</label>
                  <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Couleur primaire</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={site.primaryColor} onChange={e => setSite({...site, primaryColor: e.target.value})} className="w-10 h-10 rounded cursor-pointer border-none" />
                    <span className="text-sm text-[var(--color-text-light)]">{site.primaryColor}</span>
                  </div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Texte d'accueil</label><textarea className="input" rows={3} value={site.welcomeText} onChange={e => setSite({...site, welcomeText: e.target.value})} placeholder="Bienvenue dans notre bibliothèque..." /></div>
              </div>
              <button onClick={handleStep2} className="btn-primary w-full mt-6 flex items-center justify-center gap-2" disabled={saving}>
                {saving ? 'Enregistrement...' : <><span>Suivant</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold mb-1">Ajoutez votre premier livre</h2>
              <p className="text-sm text-[var(--color-text-light)] mb-6">Vous pourrez en ajouter d'autres plus tard depuis le dashboard.</p>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Titre</label><input className="input" value={book.title} onChange={e => setBook({...book, title: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Auteur</label><input className="input" value={book.author} onChange={e => setBook({...book, author: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">ISBN</label><input className="input" value={book.isbn} onChange={e => setBook({...book, isbn: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">Catégorie</label><input className="input" value={book.category} onChange={e => setBook({...book, category: e.target.value})} /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Nombre d'exemplaires</label><input type="number" className="input" min={1} value={book.copies} onChange={e => setBook({...book, copies: parseInt(e.target.value) || 1})} /></div>
              </div>
              <button onClick={handleStep3} className="btn-primary w-full mt-6" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Terminer'}
              </button>
              <button onClick={() => navigate('/dashboard')} className="w-full mt-3 text-sm text-[var(--color-text-light)] bg-transparent border-none cursor-pointer hover:text-[var(--color-text)]">
                Passer cette étape
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
