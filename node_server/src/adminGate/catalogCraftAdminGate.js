const crypto = require('crypto');
const { sendMail } = require('./mailer');

function htmlEscape(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function page(title, bodyHtml) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${htmlEscape(title)}</title>
    <style>
      :root { color-scheme: dark; }
      body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#070707; color:#f3f3f3; }
      .wrap { max-width: 520px; margin: 64px auto; padding: 0 16px; }
      .card { border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); border-radius: 14px; padding: 18px; }
      label { display:block; font-size: 12px; opacity: .85; margin: 12px 0 6px; }
      input { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.16); background: rgba(0,0,0,.35); color: #fff; }
      button { margin-top: 14px; width: 100%; padding: 10px 12px; border-radius: 10px; border: 0; cursor: pointer; font-weight: 600;
        background: linear-gradient(135deg, #ff3b30, #ff8a00); color: #0b0b0b; }
      .hint { margin-top: 12px; font-size: 12px; opacity: .75; line-height: 1.5; }
      .err { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,59,48,.35); background: rgba(255,59,48,.12); }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        ${bodyHtml}
      </div>
    </div>
  </body>
</html>`;
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function publicBaseUrl(cfg) {
  return String(cfg.adminGate.publicApiBaseUrl || '').replace(/\/+$/, '');
}

function isGateHost(req, cfg) {
  const prefix = String(cfg.adminGate.hostPrefix || '');
  if (!prefix) return true;
  const host = String(req.hostname || '').toLowerCase();
  return host.startsWith(prefix.toLowerCase());
}

function ensureGateEnabledOr404(req, res, cfg) {
  if (!cfg.adminGate.enabled) {
    res.status(404).send('Not found');
    return false;
  }
  if (!isGateHost(req, cfg)) {
    res.status(404).send('Not found');
    return false;
  }
  return true;
}

function mountCatalogCraftAdminGate(app, { cfg, AdminApprovalRequest }) {
  const base = String(cfg.adminGate.basePath || '/catalogcraft-admin').replace(/\/+$/, '');

  const step1Ok = (req) => Boolean(req.session && req.session.catalogcraftAdminGate && req.session.catalogcraftAdminGate.step1 === true);
  const step2Ok = (req) => Boolean(req.session && req.session.catalogcraftAdminGate && req.session.catalogcraftAdminGate.step2 === 'APPROVED');

  app.get(`${base}/login`, (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;
    if (step2Ok(req)) return res.redirect('/admin');

    const err = req.query.error ? String(req.query.error) : '';
    const body = `
      <h2 style="margin:0 0 10px;">CatalogCraft Admin</h2>
      <div class="hint">Sign in to continue to the Admin panel.</div>
      ${err ? `<p class="err">${htmlEscape(err)}</p>` : ''}
      <form method="post" action="${base}/login">
        <label for="u">Admin ID</label>
        <input id="u" name="username" autocomplete="username" required />
        <label for="p">Password</label>
        <input id="p" name="password" type="password" autocomplete="current-password" required />
        <button type="submit">Continue</button>
      </form>
    `;
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(page('Admin login', body));
  });

  app.post(`${base}/login`, (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;

    const username = String((req.body && req.body.username) || '').trim();
    const password = String((req.body && req.body.password) || '');

    const expectedUser = String(cfg.adminGate.portalUser || '');
    const expectedPass = String(cfg.adminGate.portalPassword || '');

    if (!expectedUser || !expectedPass) {
      return res.redirect(`${base}/login?error=${encodeURIComponent('Admin portal is not configured (missing ADMIN_PORTAL_USER / ADMIN_PORTAL_PASSWORD).')}`);
    }

    const ok = username === expectedUser && password === expectedPass;
    if (!ok) {
      return res.redirect(`${base}/login?error=${encodeURIComponent('Invalid admin ID or password.')}`);
    }

    req.session.catalogcraftAdminGate = {
      step1: true,
      step2: 'PENDING',
      approvalRequestId: null,
    };

    return res.redirect(`${base}/email`);
  });

  app.get(`${base}/email`, (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;
    if (!step1Ok(req)) return res.redirect(`${base}/login`);
    if (step2Ok(req)) return res.redirect('/admin');

    const err = req.query.error ? String(req.query.error) : '';
    const body = `
      <h2 style="margin:0 0 10px;">Verify your email</h2>
      <div class="hint">Enter the email address you want associated with this admin access request. An approval email will be sent to the site owner.</div>
      ${err ? `<p class="err">${htmlEscape(err)}</p>` : ''}
      <form method="post" action="${base}/email">
        <label for="e">Your email</label>
        <input id="e" name="email" type="email" autocomplete="email" required />
        <button type="submit">Request approval</button>
      </form>
    `;
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(page('Admin email verification', body));
  });

  app.post(`${base}/email`, async (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;
    if (!step1Ok(req)) return res.redirect(`${base}/login`);

    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.redirect(`${base}/email?error=${encodeURIComponent('Please enter a valid email address.')}`);
    }

    const notifyTo = String(cfg.adminGate.notifyTo || '');
    if (!notifyTo) {
      return res.redirect(`${base}/email?error=${encodeURIComponent('Approval notify email is not configured (missing ADMIN_APPROVAL_NOTIFY_TO).')}`);
    }

    const baseUrl = publicBaseUrl(cfg);
    if (!baseUrl) {
      return res.redirect(`${base}/email?error=${encodeURIComponent('PUBLIC_API_BASE_URL is not configured (needed for approve/deny links).')}`);
    }

    const approveToken = randomToken();
    const denyToken = randomToken();

    const doc = await AdminApprovalRequest.create({
      requesterEmail: email,
      status: 'PENDING',
      approveTokenHash: sha256Hex(approveToken),
      denyTokenHash: sha256Hex(denyToken),
    });

    req.session.catalogcraftAdminGate.step2 = 'PENDING';
    req.session.catalogcraftAdminGate.approvalRequestId = String(doc._id);

    const approveUrl = `${baseUrl}${base}/approve?token=${encodeURIComponent(approveToken)}`;
    const denyUrl = `${baseUrl}${base}/deny?token=${encodeURIComponent(denyToken)}`;

    const subject = `CatalogCraft admin access approval: ${email}`;
    const text = [
      `Someone passed the admin portal password and requested admin access.`,
      ``,
      `Requester email: ${email}`,
      ``,
      `Approve:`,
      approveUrl,
      ``,
      `Deny:`,
      denyUrl,
      ``,
      `Request id: ${String(doc._id)}`,
    ].join('\n');

    const html = `
      <p>Someone passed the admin portal password and requested admin access.</p>
      <p><b>Requester email:</b> ${htmlEscape(email)}</p>
      <p><b>Request id:</b> ${htmlEscape(String(doc._id))}</p>
      <p>
        <a href="${approveUrl}">Approve</a>
        &nbsp;·&nbsp;
        <a href="${denyUrl}">Deny</a>
      </p>
    `;

    try {
      await sendMail({
        mailCfg: cfg.adminGate.mail,
        to: notifyTo,
        subject,
        text,
        html,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[catalogcraft-admin-gate] failed to send approval email:', e);
      return res.redirect(`${base}/email?error=${encodeURIComponent('Failed to send approval email. Check SMTP configuration / logs.')}`);
    }

    return res.redirect(`${base}/waiting?rid=${encodeURIComponent(String(doc._id))}`);
  });

  app.get(`${base}/waiting`, async (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;
    if (!step1Ok(req)) return res.redirect(`${base}/login`);

    const rid = String(req.query.rid || '');
    const sessionRid = req.session.catalogcraftAdminGate.approvalRequestId ? String(req.session.catalogcraftAdminGate.approvalRequestId) : '';
    if (!rid || !sessionRid || rid !== sessionRid) {
      return res.redirect(`${base}/email?error=${encodeURIComponent('Invalid approval session. Please submit your email again.')}`);
    }

    const doc = await AdminApprovalRequest.findById(rid).lean();
    if (!doc) {
      return res.redirect(`${base}/email?error=${encodeURIComponent('Approval request not found.')}`);
    }

    if (doc.status === 'APPROVED') {
      req.session.catalogcraftAdminGate.step2 = 'APPROVED';
      return res.redirect('/admin');
    }

    if (doc.status === 'DENIED') {
      req.session.catalogcraftAdminGate.step2 = 'DENIED';
      const body = `
        <h2 style="margin:0 0 10px;">Access denied</h2>
        <div class="hint">The approval request was denied. You can sign out and try again later.</div>
        <a href="${base}/logout" style="display:inline-block;margin-top:14px;color:#ffb020;">Sign out</a>
      `;
      res.set('Content-Type', 'text/html; charset=utf-8');
      return res.send(page('Access denied', body));
    }

    const body = `
      <h2 style="margin:0 0 10px;">Waiting for approval</h2>
      <div class="hint">An email was sent to the site owner. Keep this page open — it will refresh automatically.</div>
      <div class="hint"><b>Request id:</b> ${htmlEscape(String(doc._id))}</div>
      <script>
        setTimeout(() => window.location.reload(), 2500);
      </script>
    `;
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.send(page('Waiting for approval', body));
  });

  app.get(`${base}/approve`, async (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;
    const token = String(req.query.token || '');
    if (!token) return res.status(400).send('Missing token');

    const doc = await AdminApprovalRequest.findOne({ approveTokenHash: sha256Hex(token) });
    if (!doc) return res.status(404).send('Invalid token');

    doc.status = 'APPROVED';
    doc.decidedAt = new Date();
    await doc.save();

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(page('Approved', `<h2 style="margin:0 0 10px;">Approved</h2><div class="hint">You can close this tab.</div>`));
  });

  app.get(`${base}/deny`, async (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;
    const token = String(req.query.token || '');
    if (!token) return res.status(400).send('Missing token');

    const doc = await AdminApprovalRequest.findOne({ denyTokenHash: sha256Hex(token) });
    if (!doc) return res.status(404).send('Invalid token');

    doc.status = 'DENIED';
    doc.decidedAt = new Date();
    await doc.save();

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(page('Denied', `<h2 style="margin:0 0 10px;">Denied</h2><div class="hint">You can close this tab.</div>`));
  });

  app.get(`${base}/logout`, (req, res) => {
    if (!ensureGateEnabledOr404(req, res, cfg)) return;
    req.session.destroy(() => {
      res.redirect(`${base}/login`);
    });
  });
}

module.exports = {
  mountCatalogCraftAdminGate,
  isGateHost,
};
