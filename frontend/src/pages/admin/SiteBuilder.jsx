import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import { sitebuilderApi } from '../../api/sitebuilder.js';
import BlockPalette from '../../components/sitebuilder/BlockPalette.jsx';
import BlockCanvas from '../../components/sitebuilder/BlockCanvas.jsx';
import BlockPropsEditor from '../../components/sitebuilder/BlockPropsEditor.jsx';
import ThemeEditor from '../../components/sitebuilder/ThemeEditor.jsx';
import { ArrowLeft, Save, Eye, Settings2, Monitor, Tablet, Smartphone, Undo2, Redo2, Check, Loader2, PanelLeftClose, PanelRightClose } from 'lucide-react';
import toast from 'react-hot-toast';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function SiteBuilder() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isThemeMode = slug === 'theme';

  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [theme, setTheme] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rightPanel, setRightPanel] = useState('props'); // 'props' | 'seo'
  const [seo, setSeo] = useState({ title: '', description: '', ogImage: '' });
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load page and theme
  useEffect(() => {
    const loadData = async () => {
      try {
        const themeData = await sitebuilderApi.getTheme();
        setTheme(themeData);

        if (!isThemeMode) {
          const pageData = await sitebuilderApi.getPage(slug);
          setPage(pageData);
          setBlocks(pageData.blocks || []);
          setSeo(pageData.seo || { title: '', description: '', ogImage: '' });
          setHistory([pageData.blocks || []]);
          setHistoryIndex(0);
        }
      } catch {
        toast.error('Erreur chargement');
        navigate('/site-builder');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug, isThemeMode, navigate]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // Push to history
  const pushHistory = useCallback((newBlocks) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newBlocks].slice(-30); // max 30 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setBlocks(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setBlocks(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // Block operations
  const addBlock = useCallback((type) => {
    const newBlock = { id: generateId(), type, props: {}, order: blocks.length };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    pushHistory(newBlocks);
  }, [blocks, pushHistory]);

  const addBlockAtIndex = useCallback((type) => {
    const newBlock = { id: generateId(), type, props: {}, order: blocks.length };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    pushHistory(newBlocks);
  }, [blocks, pushHistory]);

  const deleteBlock = useCallback((id) => {
    const newBlocks = blocks.filter((b) => b.id !== id);
    setBlocks(newBlocks);
    if (selectedBlockId === id) setSelectedBlockId(null);
    pushHistory(newBlocks);
  }, [blocks, selectedBlockId, pushHistory]);

  const duplicateBlock = useCallback((id) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const newBlock = { ...block, id: generateId(), props: { ...block.props } };
    const index = blocks.findIndex((b) => b.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    pushHistory(newBlocks);
  }, [blocks, pushHistory]);

  const reorderBlocks = useCallback((activeId, overId) => {
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === activeId);
      const newIndex = prev.findIndex((b) => b.id === overId);
      const newBlocks = arrayMove(prev, oldIndex, newIndex);
      pushHistory(newBlocks);
      return newBlocks;
    });
  }, [pushHistory]);

  const updateBlockProps = useCallback((blockId, newProps) => {
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, props: newProps } : b));
  }, []);

  const updateBlockStyles = useCallback((blockId, newStyles) => {
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, styles: newStyles } : b));
  }, []);

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      if (isThemeMode) {
        await sitebuilderApi.updateTheme(theme);
        toast.success('Thème sauvegardé');
      } else {
        const orderedBlocks = blocks.map((b, i) => ({ ...b, order: i }));
        await sitebuilderApi.updatePage(slug, { blocks: orderedBlocks, seo });
        toast.success('Page sauvegardée');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Device width for preview
  const deviceWidth = device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px';

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  // Theme editor mode
  if (isThemeMode && theme) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Top bar */}
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/site-builder')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer bg-transparent border-none">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <h1 className="font-semibold text-sm text-gray-800">Personnaliser le thème</h1>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Theme editor sidebar */}
          <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
            <ThemeEditor theme={theme} onChange={setTheme} />
          </div>

          {/* Preview */}
          <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden" style={{ fontFamily: theme.fonts?.body || 'Inter' }}>
              {/* Header preview */}
              <div className="h-14 flex items-center justify-between px-6 border-b" style={{ backgroundColor: theme.colors?.background }}>
                <span className="font-bold" style={{ color: theme.colors?.text, fontFamily: theme.fonts?.heading }}>Ma Bibliothèque</span>
                <div className="flex gap-4 text-sm" style={{ color: theme.colors?.text }}>
                  <span>Accueil</span><span>Catalogue</span><span>Contact</span>
                </div>
              </div>
              {/* Hero preview */}
              <div className="py-16 px-6" style={{ background: `linear-gradient(135deg, ${theme.colors?.primary}22, ${theme.colors?.primary}08)` }}>
                <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors?.text, fontFamily: theme.fonts?.heading }}>Bienvenue</h1>
                <p className="text-sm mb-4" style={{ color: theme.colors?.text, opacity: 0.7 }}>Découvrez notre collection</p>
                <button className="px-4 py-2 rounded-lg text-white text-sm border-none" style={{ backgroundColor: theme.colors?.primary }}>Explorer</button>
              </div>
              {/* Content preview */}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-3" style={{ fontFamily: theme.fonts?.heading, color: theme.colors?.text }}>Section titre</h2>
                <p className="text-sm" style={{ color: theme.colors?.text, opacity: 0.7 }}>Aperçu de la mise en page avec vos couleurs et polices.</p>
                <div className="flex gap-3 mt-4">
                  <div className="w-20 h-20 rounded-xl" style={{ backgroundColor: theme.colors?.primary }} />
                  <div className="w-20 h-20 rounded-xl" style={{ backgroundColor: theme.colors?.secondary }} />
                  <div className="w-20 h-20 rounded-xl" style={{ backgroundColor: theme.colors?.accent }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page editor mode
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-3 shrink-0 shadow-sm z-10">
        {/* Left: Back + page info */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/site-builder')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer bg-transparent border-none">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <div className="pl-1">
            <h1 className="font-semibold text-sm text-gray-800 leading-tight">{page?.title || 'Page'}</h1>
            <span className="text-[10px] text-gray-400 font-mono">/{page?.slug}</span>
          </div>
        </div>

        {/* Center: Device preview + undo/redo */}
        <div className="flex items-center gap-1">
          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 cursor-pointer bg-transparent border-none"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 cursor-pointer bg-transparent border-none"
            title="Rétablir (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4 text-gray-500" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Device toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {[
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
              { id: 'tablet', icon: Tablet, label: 'Tablet' },
              { id: 'mobile', icon: Smartphone, label: 'Mobile' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setDevice(id)}
                className={`p-1.5 rounded-md transition-all cursor-pointer border-none ${
                  device === id ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600 bg-transparent'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className={`p-2 rounded-lg transition-colors cursor-pointer border-none ${showLeftPanel ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-100 bg-transparent'}`}
            title="Panneau blocs"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={`p-2 rounded-lg transition-colors cursor-pointer border-none ${showRightPanel ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-100 bg-transparent'}`}
            title="Panneau propriétés"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-0.5" />

          <button
            onClick={() => setRightPanel(rightPanel === 'seo' ? 'props' : 'seo')}
            className={`p-2 rounded-lg transition-colors cursor-pointer border-none ${rightPanel === 'seo' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:bg-gray-100 bg-transparent'}`}
            title="SEO"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50 ml-1"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? '...' : saved ? 'OK' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — Block palette */}
        {showLeftPanel && (
          <div className="w-56 border-r border-gray-200 bg-white overflow-y-auto p-3 shrink-0">
            <BlockPalette onAdd={addBlock} />
          </div>
        )}

        {/* Center — Canvas */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-center min-h-full p-6">
            <div
              className="transition-all duration-300"
              style={{ width: deviceWidth, maxWidth: '100%' }}
            >
              {device !== 'desktop' && (
                <div className="bg-gray-800 rounded-t-2xl h-6 flex items-center justify-center">
                  <div className="w-16 h-1 bg-gray-600 rounded-full" />
                </div>
              )}
              <div className={`bg-white ${device !== 'desktop' ? 'border-x-2 border-gray-800 rounded-b-2xl shadow-2xl' : 'rounded-2xl shadow-sm'} min-h-[500px]`}>
                <BlockCanvas
                  blocks={blocks}
                  theme={theme}
                  selectedBlockId={selectedBlockId}
                  onSelect={setSelectedBlockId}
                  onReorder={reorderBlocks}
                  onDelete={deleteBlock}
                  onDuplicate={duplicateBlock}
                  onAdd={addBlock}
                />
              </div>
              {device !== 'desktop' && (
                <div className="bg-gray-800 rounded-b-2xl h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar — Props editor or SEO */}
        {showRightPanel && (
          <div className="w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
            {rightPanel === 'seo' ? (
              <div>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">Référencement (SEO)</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Optimisez pour les moteurs de recherche</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Titre SEO</label>
                    <input
                      type="text"
                      value={seo.title}
                      onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                      placeholder={page?.title}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{(seo.title || page?.title || '').length}/60 caractères</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                    <textarea
                      value={seo.description}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] resize-y"
                      rows={3}
                      placeholder="Description pour les moteurs de recherche"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{(seo.description || '').length}/160 caractères</p>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Image OG</label>
                    <input
                      type="text"
                      value={seo.ogImage}
                      onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                      placeholder="https://..."
                    />
                  </div>
                  {/* SEO Preview */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Aperçu Google</p>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[#1a0dab] text-sm font-medium truncate">{seo.title || page?.title || 'Titre de la page'}</p>
                      <p className="text-[#006621] text-xs truncate mt-0.5">votresite.com/{page?.slug}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{seo.description || 'Ajoutez une description pour améliorer votre référencement.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <BlockPropsEditor
                block={selectedBlock}
                onChange={updateBlockProps}
                onStyleChange={updateBlockStyles}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
