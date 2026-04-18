const { isGateHost } = require('./catalogCraftAdminGate');

function isAdminAssetPath(urlPath) {
  return (
    urlPath.startsWith('/admin/frontend/assets/')
    || urlPath === '/admin/frontend/assets/components.bundle.js'
  );
}

function isLikelyAdminSpaNavigation(req) {
  // AdminJS serves HTML shell for GET HTML navigations; API calls are mostly under /admin/api/*
  return req.method === 'GET' && !urlPathStartsWith(req, '/admin/api/');
}

function urlPathStartsWith(req, prefix) {
  const p = req.path || '';
  return p.startsWith(prefix);
}

function adminPanelGateMiddleware(cfg) {
  return (req, res, next) => {
    if (!cfg.adminGate.enabled) return next();
    if (!isGateHost(req, cfg)) return next();

    const gate = req.session && req.session.catalogcraftAdminGate;
    const approved = Boolean(gate && gate.step2 === 'APPROVED');

    if (approved) return next();

    // Always allow static bundles for the AdminJS UI shell.
    if (isAdminAssetPath(req.path)) return next();

    // If someone is mid-flow, allow them to finish gate pages even under the same host.
    const base = String(cfg.adminGate.basePath || '/catalogcraft-admin').replace(/\/+$/, '');
    if (req.path.startsWith(`${base}/`)) return next();

    // For the AdminJS app shell routes, bounce to the gate login.
    if (req.path.startsWith('/admin')) {
      if (isLikelyAdminSpaNavigation(req)) {
        return res.redirect(`${base}/login`);
      }

      // Block API mutations while not approved (defense-in-depth).
      if (req.method !== 'GET' && req.method !== 'HEAD' && urlPathStartsWith(req, '/admin/api/')) {
        return res.status(401).type('text/plain').send('Admin approval required');
      }
    }

    return next();
  };
}

module.exports = {
  adminPanelGateMiddleware,
};
