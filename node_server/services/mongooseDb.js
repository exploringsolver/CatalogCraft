const mongoose = require('mongoose');
const config = require('../config');

const dbUrl = config.dbUrlMongoDB;
const isProd = process.env.NODE_ENV === 'production';

const connectDB = async () => {
  if (!dbUrl) {
    if (isProd) {
      throw new Error('Missing dbUrlMongoDB in production environment.');
    }
    console.warn('MongoDB URI is missing (set dbUrlMongoDB in env). Continuing without database connection.');
    return false;
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return true;
  }

  try {
    await mongoose.connect(dbUrl);
    console.log('Mongodb connected');
    return true;
  } catch (err) {
    if (isProd) {
      throw err;
    }
    console.error('Error connecting to MongoDB', err);
    return false;
  }
};

module.exports = {
  mongoose,
  connectDB,
};
