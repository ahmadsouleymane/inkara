import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksApi } from '../api/books.js';
import { categoriesApi } from '../api/categories.js';
import { lookupApi } from '../api/lookup.js';
import { ArrowLeft, Search, Loader2, Camera, X } from 'lucide-react';
import QRScanner from '../components/QRScanner.jsx';
import toast from 'react-hot-toast';

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', publisher: '', year: '',
    pages: '', category: '', description: '', copies: '1',
    condition: 'bon', location: '', cover: '',
    language: '', format: 'physical', tags: '', subjects: '',
  });

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);

    if (isEditing) {
      booksApi.getById(id).then((book) => {
        setForm({
          title: book.title || '',
          author: book.author?.join(', ') || '',
          isbn: book.isbn || '',
          publisher: book.publisher || '',
          year: book.year || '',
          pages: book.pages?.toString() || '',
          category: book.category || '',
          description: book.description || '',
          copies: book.copies?.toString() || '1',
          condition: book.condition || 'bon',
          location: book.location || '',
          cover: book.cover || '',
          language: book.language || '',
          format: book.format || 'physical',
          tags: book.tags?.join(', ') || '',
          subjects: book.subjects?.join(', ') || '',
        });
      }).catch(() => toast.error('Livre introuvable'));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleISBNLookup = async () => {
    if (!form.isbn || form.isbn.length < 10) {
      return toast.error('Entrez un ISBN valide (10 ou 13 caractères)');
    }

    try {
      setLookingUp(true);
      const data = await lookupApi.byISBN(form.isbn);

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        author: data.author?.join(', ') || prev.author,
        publisher: data.publisher || prev.publisher,
        year: data.year || prev.year,
        pages: data.pages?.toString() || prev.pages,
        description: data.description || prev.description,
        cover: data.cover || prev.cover,
        language: data.language || prev.language,
        subjects: data.subjects?.join(', ') || prev.subjects,
      }));

      toast.success(`Informations trouvées (${data._source === 'openlibrary' ? 'Open Library' : 'Google Books'})`);
    } catch (err) {
      toast.error(err.message || 'Aucun résultat pour cet ISBN');
    } finally {
      setLookingUp(false);
    }
  };

  const openScanner = () => {
    setShowScanner(true);
    setScannerActive(true);
  };

  const closeScanner = () => {
    setScannerActive(false);
    setShowScanner(false);
  };

  const handleBarcodeScan = useCallback(async (decodedText) => {
    setScannerActive(false);
    const isbn = decodedText.replace(/[^0-9X]/gi, '');
    if (isbn.length < 10) {
      toast.error('Code-barres invalide');
      setScannerActive(true);
      return;
    }

    setForm((prev) => ({ ...prev, isbn }));
    setShowScanner(false);
    toast.success(`ISBN détecté : ${isbn}`);

    // Auto-lookup
    try {
      setLookingUp(true);
      const data = await lookupApi.byISBN(isbn);
      setForm((prev) => ({
        ...prev,
        isbn,
        title: data.title || prev.title,
        author: data.author?.join(', ') || prev.author,
        publisher: data.publisher || prev.publisher,
        year: data.year || prev.year,
        pages: data.pages?.toString() || prev.pages,
        description: data.description || prev.description,
        cover: data.cover || prev.cover,
        language: data.language || prev.language,
        subjects: data.subjects?.join(', ') || prev.subjects,
      }));
      toast.success(`Informations trouvées (${data._source === 'openlibrary' ? 'Open Library' : 'Google Books'})`);
    } catch {
      toast('ISBN rempli — complétez les informations manuellement', { icon: 'ℹ️' });
    } finally {
      setLookingUp(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('author', JSON.stringify(form.author.split(',').map((a) => a.trim())));
      formData.append('isbn', form.isbn);
      formData.append('publisher', form.publisher);
      formData.append('year', form.year);
      formData.append('pages', form.pages);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('copies', form.copies);
      formData.append('availableCopies', form.copies);
      formData.append('condition', form.condition);
      formData.append('location', form.location);
      formData.append('language', form.language);
      formData.append('format', form.format);
      formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      formData.append('subjects', JSON.stringify(form.subjects.split(',').map(s => s.trim()).filter(Boolean)));

      if (coverFile) {
        formData.append('cover', coverFile);
      } else if (form.cover && !coverFile) {
        formData.append('cover', form.cover);
      }

      if (isEditing) {
        await booksApi.update(id, formData);
        toast.success('Livre modifié');
      } else {
        await booksApi.create(formData);
        toast.success('Livre ajouté');
      }

      navigate('/livres');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] mb-6 cursor-pointer bg-transparent border-none">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Modifier le livre' : 'Ajouter un livre'}
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-5">
        {/* ISBN avec lookup et scanner */}
        <div>
          <label className="block text-sm font-medium mb-1.5">ISBN</label>
          <div className="flex gap-2">
            <input name="isbn" className="input flex-1" placeholder="978-2-07-036024-8" value={form.isbn} onChange={handleChange} />
            <button
              type="button"
              onClick={openScanner}
              className="btn-secondary flex items-center gap-2 shrink-0"
              title="Scanner le code-barres"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
            </button>
            <button
              type="button"
              onClick={handleISBNLookup}
              disabled={lookingUp}
              className="btn-secondary flex items-center gap-2 shrink-0"
            >
              {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Remplir depuis ISBN</span>
              <span className="sm:hidden">Chercher</span>
            </button>
          </div>

          {/* Scanner modal */}
          {showScanner && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeScanner}>
              <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Scanner le code-barres ISBN</h3>
                  <button type="button" onClick={closeScanner} className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer bg-transparent border-none">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-[var(--color-text-light)] mb-4">
                  Placez le code-barres du livre devant la caméra
                </p>
                <QRScanner
                  onScan={handleBarcodeScan}
                  onError={(msg) => toast.error(msg)}
                  active={scannerActive}
                  mode="barcode"
                />
                <button type="button" onClick={closeScanner} className="btn-secondary w-full mt-4">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Titre *</label>
            <input name="title" className="input" value={form.title} onChange={handleChange} required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Auteur(s) * <span className="font-normal text-[var(--color-text-light)]">(séparés par des virgules)</span></label>
            <input name="author" className="input" placeholder="Victor Hugo, Albert Camus" value={form.author} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Éditeur</label>
            <input name="publisher" className="input" value={form.publisher} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Année</label>
            <input name="year" className="input" value={form.year} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Pages</label>
            <input name="pages" type="number" className="input" value={form.pages} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Langue</label>
            <input name="language" className="input" placeholder="fr, en, ar..." value={form.language} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Catégorie *</label>
            <select name="category" className="input" value={form.category} onChange={handleChange} required>
              <option value="">Sélectionner...</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Format</label>
            <select name="format" className="input" value={form.format} onChange={handleChange}>
              <option value="physical">Physique</option>
              <option value="ebook">E-book</option>
              <option value="audiobook">Livre audio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Exemplaires</label>
            <input name="copies" type="number" min="1" className="input" value={form.copies} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">État</label>
            <select name="condition" className="input" value={form.condition} onChange={handleChange}>
              <option value="neuf">Neuf</option>
              <option value="bon">Bon</option>
              <option value="usé">Usé</option>
              <option value="endommagé">Endommagé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Emplacement</label>
            <input name="location" className="input" placeholder="Rayon A, Étagère 3" value={form.location} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tags <span className="font-normal text-[var(--color-text-light)]">(séparés par des virgules)</span></label>
            <input name="tags" className="input" placeholder="bestseller, classique" value={form.tags} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Sujets <span className="font-normal text-[var(--color-text-light)]">(séparés par des virgules)</span></label>
            <input name="subjects" className="input" placeholder="Littérature française, Roman" value={form.subjects} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea name="description" className="input min-h-[100px] resize-y" value={form.description} onChange={handleChange} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">Couverture</label>
            {form.cover && !coverFile && (
              <div className="mb-2">
                <img
                  src={form.cover.startsWith('http') ? form.cover : `${import.meta.env.VITE_API_URL || 'http://localhost:7080'}${form.cover}`}
                  alt="Couverture"
                  className="w-20 h-28 object-cover rounded border border-[var(--color-border)]"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setCoverFile(e.target.files[0])}
            />
            {!coverFile && form.cover && (
              <p className="text-xs text-[var(--color-text-light)] mt-1">Image actuelle conservée</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
