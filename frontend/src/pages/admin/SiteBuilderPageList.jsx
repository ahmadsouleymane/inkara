import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sitebuilderApi } from '../../api/sitebuilder.js';
import {
  Plus, FileText, Home, Eye, EyeOff, Trash2, Pencil, ExternalLink,
  Palette, Layers, ArrowRight, Globe, GripVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageTemplateChooser from '../../components/sitebuilder/PageTemplateChooser.jsx';

export default function SiteBuilderPageList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await sitebuilderApi.getPages();
      setPages(data);
    } catch {
      toast.error('Erreur chargement des pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTitleSubmit = () => {
    if (!newTitle.trim()) return;
    setShowCreate(false);
    setShowTemplates(true);
  };

  const handleTemplateSelect = async (template) => {
    try {
      const blocks = (template.blocks || []).map((b, i) => ({
        id: Math.random().toString(36).substring(2, 10),
        type: b.type,
        props: b.props || {},
        styles: {},
        order: i,
      }));
      const page = await sitebuilderApi.createPage({ title: newTitle.trim(), blocks });
      toast.success('Page créée');
      setNewTitle('');
      setShowTemplates(false);
      navigate(`/site-builder/${page.slug}`);
    } catch (err) {
      toast.error(err.message || 'Erreur');
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm('Supprimer cette page ?')) return;
    try {
      await sitebuilderApi.deletePage(slug);
      toast.success('Page supprimée');
      load();
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const togglePublish = async (page) => {
    try {
      await sitebuilderApi.updatePage(page.slug, { isPublished: !page.isPublished });
      toast.success(page.isPublished ? 'Page masquée' : 'Page publiée');
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center pt-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Site Builder</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>Créez et gérez les pages de votre site public</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/site-builder/theme')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <Palette className="w-4 h-4" /> Thème
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" /> Nouvelle page
          </button>
        </div>
      </div>

      {/* Quick stats */}
      {pages.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(33,150,243,0.1)' }}>
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{pages.length}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Pages créées</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(1,20,220,0.1)' }}>
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{pages.filter((p) => p.isPublished).length}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Pages publiées</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(156,39,176,0.1)' }}>
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{pages.reduce((s, p) => s + (p.blocks?.length || 0), 0)}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Blocs au total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowCreate(false); setNewTitle(''); }}>
          <div className="rounded-2xl shadow-xl p-6 w-full max-w-md" style={{ backgroundColor: 'var(--color-surface)' }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>Nouvelle page</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-light)' }}>Donnez un titre à votre nouvelle page</p>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex : À propos, Contact, Services..."
              className="input mb-5"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowCreate(false); setNewTitle(''); }}
                className="btn-secondary rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleTitleSubmit}
                disabled={!newTitle.trim()}
                className="px-4 py-2.5 text-sm font-medium text-white bg-[var(--color-primary)] rounded-xl hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-40"
              >
                Suivant — Choisir un template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template chooser */}
      {showTemplates && (
        <PageTemplateChooser
          onSelect={handleTemplateSelect}
          onClose={() => { setShowTemplates(false); setNewTitle(''); }}
        />
      )}

      {/* Page list */}
      <div className="space-y-3">
        {pages.map((page) => (
          <div
            key={page.slug}
            className="card flex items-center gap-5 hover:shadow-md transition-all group cursor-pointer"
            onClick={() => navigate(`/site-builder/${page.slug}`)}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              page.isHomepage ? 'bg-[var(--color-primary)]/10' : ''
            }`}>
              {page.isHomepage
                ? <Home className="w-5 h-5 text-[var(--color-primary)]" />
                : <FileText className="w-5 h-5" style={{ color: 'var(--color-text-light)' }} />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{page.title}</h3>
                {page.isHomepage && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">Accueil</span>
                )}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  page.isPublished ? 'bg-blue-50 text-blue-600' : 'badge-info'
                }`}>
                  {page.isPublished ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-light)' }}>/{page.slug}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                  {page.blocks?.length || 0} bloc{(page.blocks?.length || 0) > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => togglePublish(page)}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer border-none ${page.isPublished ? 'text-blue-600 hover:bg-blue-50 bg-transparent' : 'text-gray-400 hover:bg-gray-50 bg-transparent'}`}
                title={page.isPublished ? 'Masquer' : 'Publier'}
              >
                {page.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigate(`/site-builder/${page.slug}`)}
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent"
                title="Modifier"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {!page.isHomepage && (
                <button
                  onClick={() => handleDelete(page.slug)}
                  className="p-2.5 rounded-xl text-red-400 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </div>
        ))}

        {pages.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 flex items-center justify-center">
              <Layers className="w-9 h-9 text-[var(--color-primary)] opacity-60" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Aucune page créée</h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--color-text-light)' }}>
              Commencez par créer votre première page pour construire le site public de votre bibliothèque.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" /> Créer ma première page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
