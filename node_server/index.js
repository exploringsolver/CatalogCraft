const session = require('express-session');
const config = require('./config');
const app = require('./app');
const { connectDB } = require('./services/mongooseDb');
const { mountCatalogCraftAdminGate, isGateHost } = require('./src/adminGate/catalogCraftAdminGate');
const { adminPanelGateMiddleware } = require('./src/adminGate/adminGateMiddleware');
const AdminApprovalRequest = require('./src/adminGate/models/adminApprovalRequest');

const PORT = process.env.PORT || config.port;
const isProd = process.env.NODE_ENV === 'production';

const start = async () => {
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.warn('Running API without MongoDB connection. Set dbUrlMongoDB to enable DB-backed features.');
  }

  const sessionSecret = process.env.SESSION_SECRET || (!isProd ? 'dev-insecure-session-secret' : '');
  if (!sessionSecret) {
    throw new Error('Missing SESSION_SECRET (required in production)');
  }

  app.use(
    session({
      name: 'catalogcraft.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
      },
    })
  );

  mountCatalogCraftAdminGate(app, { cfg: config, AdminApprovalRequest });
  app.use(adminPanelGateMiddleware(config));

  // Dynamically import AdminJS and @adminjs/mongoose
  const { default: AdminJS } = await import('adminjs');
  const AdminJSMongoose = await import('@adminjs/mongoose');
  const { buildRouter } = require('@adminjs/express');

  // Import User and Post models
  const User = require('./src/users/models/user'); // Ensure this path is correct
  const Catalogue = require('./src/catalogues/models/catalogue'); // Ensure this path is correct
  const CatalogueTemplate = require('./src/catalogues/models/catalogueTemplate'); // Ensure this path is correct
  const Category = require('./src/catalogues/models/categories'); // Ensure this path is correct
  const SellerCatalogue = require('./src/catalogues/models/sellerCatalogue'); // Ensure this path is correct

  // Register AdminJS Mongoose adapter
  AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  });

  // Configure AdminJS
  const adminOptions = {
    resources: [
      { resource: User, options: { parent: { name: 'User Management' } } },
      { resource: Catalogue, options: { parent: { name: 'Catalog Management' } } },
      { resource: CatalogueTemplate, options: { parent: { name: 'Catalog Management' } } },
      { resource: Category, options: { parent: { name: 'Catalog Management' } } },
      { resource: SellerCatalogue, options: { parent: { name: 'Catalog Management' } } },
    ],
    rootPath: '/admin',
  };

  const admin = new AdminJS(adminOptions);
  const adminRouter = buildRouter(admin);
  app.use(admin.options.rootPath, adminRouter);

  app.get('/', (req, res) => {
    if (config.adminGate.enabled && isGateHost(req, config)) {
      return res.redirect(`${String(config.adminGate.basePath || '/catalogcraft-admin').replace(/\/+$/, '')}/login`);
    }
    return res.type('text/plain').send('Welcome to the CatalogCraft node API!');
  });

  app.use((req, res) => {
    res.status(404).type('text/plain').send('Not found');
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`AdminJS mounted at http://localhost:${PORT}${admin.options.rootPath}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
