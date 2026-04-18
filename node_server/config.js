require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const config = {
  port: 3018,
  // dbUrlMongoDB: "mongodb://localhost:27017/ondc",
  dbUrlMongoDB: process.env.dbUrlMongoDB,
  API_KEY_JWT: process.env.API_KEY_JWT,
  TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN,

  // Admin gate (api.* host): password + email approval before /admin is usable
  adminGate: {
    enabled: process.env.ADMIN_GATE_ENABLED !== 'false',
    hostPrefix: process.env.ADMIN_GATE_HOST_PREFIX || 'api.',
    basePath: process.env.ADMIN_GATE_BASE_PATH || '/catalogcraft-admin',

    // Step 1 credentials (do NOT commit real values; set via env in deployment)
    portalUser: process.env.ADMIN_PORTAL_USER || (!isProd ? 'admin' : ''),
    portalPassword: process.env.ADMIN_PORTAL_PASSWORD || (!isProd ? 'admin' : ''),

    // Email notify + public links in the email body
    notifyTo: process.env.ADMIN_APPROVAL_NOTIFY_TO || (!isProd ? 'solvorlabs@gmail.com' : ''),
    publicApiBaseUrl:
      process.env.PUBLIC_API_BASE_URL
      || process.env.VITE_BACKEND_URL
      || (!isProd ? 'http://localhost:3018' : ''),

    // SMTP (optional). If missing, outbound email falls back to console logging in non-prod.
    mail: {
      transport: process.env.MAIL_TRANSPORT || (!isProd ? 'log' : 'smtp'), // smtp | log
      from: process.env.MAIL_FROM || 'CatalogCraft <no-reply@localhost>',
      smtp: {
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
  },
};

module.exports = config;
