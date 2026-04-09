import Organization from '../models/Organization.js';

/**
 * Subdomain routing middleware.
 * Detects org slug from subdomain (e.g., my-library.smartlib.app)
 * and attaches it to req for downstream handlers.
 */
export const subdomainRouter = async (req, res, next) => {
  try {
    const host = req.hostname;
    const baseDomain = process.env.BASE_DOMAIN || 'smartlib.app';

    // Skip if not a subdomain request
    if (!host.endsWith(baseDomain) || host === baseDomain || host === `www.${baseDomain}`) {
      return next();
    }

    // Extract subdomain (slug)
    const slug = host.replace(`.${baseDomain}`, '').toLowerCase();
    if (!slug || slug === 'www' || slug === 'api') {
      return next();
    }

    // Check for custom domain mapping
    const org = await Organization.findOne({
      $or: [
        { slug },
        { customDomain: host },
      ],
      isPublished: true,
    });

    if (org) {
      req.publicOrg = org;
      req.publicSlug = org.slug;
    }

    next();
  } catch (error) {
    next();
  }
};
