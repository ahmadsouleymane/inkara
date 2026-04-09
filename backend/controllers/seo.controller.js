import Organization from '../models/Organization.js';
import SitePage from '../models/SitePage.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// GET /api/organization/public/:slug/sitemap.xml
export const getSitemap = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug, isPublished: true });
    if (!org) return res.status(404).send('Not found');

    const pages = await SitePage.find({ organizationId: org._id, isPublished: true })
      .select('slug updatedAt')
      .sort({ order: 1 });

    const baseUrl = org.customDomain
      ? `https://${org.customDomain}`
      : `${BASE_URL}/lib/${org.slug}`;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const page of pages) {
      const loc = page.slug === 'accueil' ? baseUrl : `${baseUrl}/${page.slug}`;
      const lastmod = page.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `  </url>\n`;
    }

    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
};

// GET /api/organization/public/:slug/robots.txt
export const getRobotsTxt = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug, isPublished: true });
    if (!org) return res.status(404).send('Not found');

    const baseUrl = org.customDomain
      ? `https://${org.customDomain}`
      : `${BASE_URL}/lib/${org.slug}`;

    let txt = 'User-agent: *\n';
    txt += 'Allow: /\n';
    txt += `Sitemap: ${baseUrl}/sitemap.xml\n`;

    res.set('Content-Type', 'text/plain');
    res.send(txt);
  } catch (error) {
    res.status(500).send('Error generating robots.txt');
  }
};

// GET /api/organization/public/:slug/meta/:pageSlug?
export const getPageMeta = async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.slug, isPublished: true });
    if (!org) return res.status(404).json({ message: 'Not found' });

    const pageSlug = req.params.pageSlug || 'accueil';
    const page = await SitePage.findOne({
      organizationId: org._id,
      slug: pageSlug,
      isPublished: true,
    }).select('title seo');

    if (!page) return res.status(404).json({ message: 'Page not found' });

    const baseUrl = org.customDomain
      ? `https://${org.customDomain}`
      : `${BASE_URL}/lib/${org.slug}`;

    res.json({
      title: page.seo?.title || `${page.title} — ${org.name}`,
      description: page.seo?.description || org.description || `Site de ${org.name}`,
      ogImage: page.seo?.ogImage || org.logo || '',
      url: pageSlug === 'accueil' ? baseUrl : `${baseUrl}/${pageSlug}`,
      siteName: org.name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
