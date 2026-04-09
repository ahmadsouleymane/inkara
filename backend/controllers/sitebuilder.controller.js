import SitePage from '../models/SitePage.js';
import SiteTheme from '../models/SiteTheme.js';
import Organization from '../models/Organization.js';

// ==================== PAGES ====================

// GET /api/sitebuilder/pages
export const getPages = async (req, res) => {
  try {
    const pages = await SitePage.find({ organizationId: req.organizationId }).sort({ order: 1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sitebuilder/pages/:slug
export const getPage = async (req, res) => {
  try {
    const page = await SitePage.findOne({ organizationId: req.organizationId, slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page introuvable.' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sitebuilder/pages
export const createPage = async (req, res) => {
  try {
    const { title, slug, isHomepage, blocks, seo } = req.body;

    // Si homepage, retirer le flag des autres pages
    if (isHomepage) {
      await SitePage.updateMany({ organizationId: req.organizationId }, { isHomepage: false });
    }

    const maxOrder = await SitePage.findOne({ organizationId: req.organizationId }).sort({ order: -1 });
    const page = await SitePage.create({
      organizationId: req.organizationId,
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      isHomepage: isHomepage || false,
      blocks: blocks || [],
      seo: seo || {},
      order: (maxOrder?.order || 0) + 1,
    });

    res.status(201).json(page);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ce slug de page existe déjà.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sitebuilder/pages/:slug
export const updatePage = async (req, res) => {
  try {
    const { title, slug: newSlug, isHomepage, isPublished, blocks, seo, order } = req.body;

    if (isHomepage) {
      await SitePage.updateMany(
        { organizationId: req.organizationId, slug: { $ne: req.params.slug } },
        { isHomepage: false }
      );
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (newSlug !== undefined) updates.slug = newSlug;
    if (isHomepage !== undefined) updates.isHomepage = isHomepage;
    if (isPublished !== undefined) updates.isPublished = isPublished;
    if (blocks !== undefined) updates.blocks = blocks;
    if (seo !== undefined) updates.seo = seo;
    if (order !== undefined) updates.order = order;

    const page = await SitePage.findOneAndUpdate(
      { organizationId: req.organizationId, slug: req.params.slug },
      updates,
      { new: true, runValidators: true }
    );

    if (!page) return res.status(404).json({ message: 'Page introuvable.' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sitebuilder/pages/:slug
export const deletePage = async (req, res) => {
  try {
    const page = await SitePage.findOneAndDelete({ organizationId: req.organizationId, slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page introuvable.' });
    res.json({ message: 'Page supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sitebuilder/pages/reorder
export const reorderPages = async (req, res) => {
  try {
    const { pages } = req.body; // [{ slug, order }]
    for (const { slug, order } of pages) {
      await SitePage.findOneAndUpdate({ organizationId: req.organizationId, slug }, { order });
    }
    res.json({ message: 'Ordre mis à jour.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== THÈME ====================

// GET /api/sitebuilder/theme
export const getTheme = async (req, res) => {
  try {
    let theme = await SiteTheme.findOne({ organizationId: req.organizationId });
    if (!theme) {
      theme = await SiteTheme.create({ organizationId: req.organizationId });
    }
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sitebuilder/theme
export const updateTheme = async (req, res) => {
  try {
    const theme = await SiteTheme.findOneAndUpdate(
      { organizationId: req.organizationId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PUBLIC ====================

// GET /api/organization/public/:slug/pages
export const getPublicPages = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org || !org.isPublished) return res.status(404).json({ message: 'Site introuvable.' });

    const pages = await SitePage.find({ organizationId: org._id, isPublished: true }).sort({ order: 1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organization/public/:slug/pages/:pageSlug
export const getPublicPage = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org || !org.isPublished) return res.status(404).json({ message: 'Site introuvable.' });

    const page = await SitePage.findOne({ organizationId: org._id, slug: req.params.pageSlug, isPublished: true });
    if (!page) return res.status(404).json({ message: 'Page introuvable.' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organization/public/:slug/theme
export const getPublicTheme = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug });
    if (!org || !org.isPublished) return res.status(404).json({ message: 'Site introuvable.' });

    const theme = await SiteTheme.findOne({ organizationId: org._id });
    res.json(theme || { template: 'modern', colors: { primary: '#4CAF7D', secondary: '#2196F3', accent: '#FF9800', background: '#FFFFFF', text: '#1a1a1a' }, fonts: { heading: 'Inter', body: 'Inter' } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== TEMPLATES PAR DÉFAUT ====================

export const createDefaultPages = async (organizationId) => {
  try {
    const existing = await SitePage.countDocuments({ organizationId });
    if (existing > 0) return;

    await SitePage.insertMany([
      {
        organizationId,
        slug: 'accueil',
        title: 'Accueil',
        isHomepage: true,
        order: 0,
        blocks: [
          { id: 'hero-1', type: 'hero', props: { title: 'Bienvenue à la bibliothèque', subtitle: 'Explorez notre collection', buttonText: 'Voir le catalogue', buttonLink: 'catalogue' }, order: 0 },
          { id: 'featured-1', type: 'featured-books', props: { title: 'Nos recommandations', count: 6 }, order: 1 },
          { id: 'stats-1', type: 'stats', props: { title: 'En chiffres' }, order: 2 },
        ],
      },
      {
        organizationId,
        slug: 'catalogue',
        title: 'Catalogue',
        order: 1,
        blocks: [
          { id: 'catalog-1', type: 'catalog', props: { title: 'Notre catalogue', showSearch: true, showFilters: true }, order: 0 },
        ],
      },
      {
        organizationId,
        slug: 'evenements',
        title: 'Événements',
        order: 2,
        blocks: [
          { id: 'events-1', type: 'events', props: { title: 'Événements à venir', count: 6 }, order: 0 },
        ],
      },
      {
        organizationId,
        slug: 'a-propos',
        title: 'À propos',
        order: 3,
        blocks: [
          { id: 'text-1', type: 'text', props: { title: 'À propos de nous', content: 'Bienvenue dans notre bibliothèque. Nous sommes dédiés à promouvoir la lecture et le partage du savoir.' }, order: 0 },
          { id: 'hours-1', type: 'hours', props: { title: 'Horaires d\'ouverture' }, order: 1 },
          { id: 'contact-1', type: 'contact', props: { title: 'Nous contacter', showMap: false }, order: 2 },
        ],
      },
    ]);

    // Créer le thème par défaut
    await SiteTheme.findOneAndUpdate(
      { organizationId },
      { organizationId },
      { upsert: true }
    );
  } catch (error) {
    console.error('[SiteBuilder] Erreur création templates:', error.message);
  }
};
