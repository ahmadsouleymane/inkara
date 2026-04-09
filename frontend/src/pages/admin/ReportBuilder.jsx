import { useState } from 'react';
import { statsApi } from '../../api/stats.js';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';

export default function ReportBuilder() {
  const [type, setType] = useState('loans');
  const [format, setFormat] = useState('excel');

  const handleExport = async () => {
    const token = localStorage.getItem('smartlib_token');
    const url = format === 'excel'
      ? statsApi.getExportUrl(type)
      : statsApi.getPdfExportUrl(type);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7080'}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur de téléchargement');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = format === 'excel' ? `smartlib-${type}.xlsx` : `smartlib-${type}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      alert('Erreur lors du téléchargement');
    }
  };

  const types = [
    { value: 'loans', label: 'Emprunts', description: 'Liste des emprunts avec membres, livres, dates et statuts' },
    { value: 'users', label: 'Membres', description: 'Liste des membres avec noms, emails, rôles et dates d\'inscription' },
    { value: 'books', label: 'Livres', description: 'Catalogue avec titres, auteurs, ISBN, catégories et disponibilité' },
  ];

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileSpreadsheet className="w-7 h-7" />
        Générateur de rapports
      </h1>

      <div className="card max-w-xl space-y-6">
        {/* Type de rapport */}
        <div>
          <label className="block text-sm font-medium mb-3">Type de rapport</label>
          <div className="space-y-2">
            {types.map((t) => (
              <label
                key={t.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  type === t.value ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  checked={type === t.value}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-medium text-sm">{t.label}</p>
                  <p className="text-xs text-[var(--color-text-light)]">{t.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium mb-3">Format d'export</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                format === 'excel' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-sm">Excel (.xlsx)</p>
                <p className="text-xs text-[var(--color-text-light)]">Tableaux formatés</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border transition-colors ${
                format === 'pdf' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
              }`}
            >
              <FileText className="w-6 h-6 text-red-500" />
              <div className="text-left">
                <p className="font-medium text-sm">PDF</p>
                <p className="text-xs text-[var(--color-text-light)]">Prêt à imprimer</p>
              </div>
            </button>
          </div>
        </div>

        {/* Bouton export */}
        <button onClick={handleExport} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          <Download className="w-5 h-5" />
          Télécharger le rapport
        </button>
      </div>
    </div>
  );
}
