/**
 * Tenant isolation middleware.
 *
 * Must be used after the auth middleware so that req.user is available.
 *
 * - Superadmins can access all organizations (optionally filtered via ?orgId=).
 * - Regular users are scoped to their own organization.
 * - Users without an organization receive a 403 response.
 */
export const tenantIsolation = (req, res, next) => {
  if (req.user.role === 'superadmin') {
    // superadmin can access everything, optionally filter by query param
    req.organizationId = req.query.orgId || null;
    return next();
  }

  if (!req.user.organizationId) {
    return res.status(403).json({ message: 'Aucune organisation associée.' });
  }

  req.organizationId = req.user.organizationId;
  next();
};
