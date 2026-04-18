const statusRoutes = require('../src/health/routes');
const userRoutes = require('../src/users/routes');
const catalogueRoutes = require('../src/catalogues/routes');

module.exports = (app) => {
  app.use('/status', statusRoutes);
  app.use('/auth', userRoutes);
  app.use('/catalogue', catalogueRoutes);

};
