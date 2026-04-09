import { useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminImport() {
  const [type, setType] = useState('books');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Sélectionnez un fichier CSV.');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('smartlib_token');
    try {
      const res = await fetch(`${API_URL}/api/${type}/import-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      if (data.errors?.length > 0) {
        data.errors.forEach(err => toast.error(err, { duration: 5000 }));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <FileSpreadsheet className="w-7 h-7" /> Import CSV
      </h1>

      <form onSubmit={handleSubmit} className="card max-w-lg space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Type de données</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="books">Livres</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Fichier CSV</label>
          <input type="file" accept=".csv" className="input" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {loading ? 'Import en cours...' : 'Importer'}
        </button>
      </form>
    </div>
  );
}
