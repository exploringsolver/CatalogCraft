const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const mongoose = require('../../../services/mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Register new user
exports.register = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).send({ error: 'Database is unavailable. Please try again shortly.' });
  }
  try {
    const { email, password, name, number, role } = req.body;
    const user = await User.createUser(email, password, name, number, role);
    res.status(201).send({ message: 'User registered successfully', user });
  } catch (error) {
    const rawMessage = error?.message || 'Registration failed';
    // Mongo duplicate key (unique email) -> return a clean, user-friendly response.
    if (error?.code === 11000 || rawMessage.includes('E11000')) {
      return res
        .status(409)
        .send({ error: 'Email is already registered. Please sign in.' });
    }

    return res.status(400).send({ error: rawMessage });
  }
};

// Login user
exports.login = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).send({ error: 'Database is unavailable. Please try again shortly.' });
  }
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
    // Return 'access' key for frontend compatibility
    res.send({ message: 'Login successful', access: token, token, user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Logout user (stateless JWT - client discards token)
exports.logout = async (req, res) => {
  try {
    res.status(200).send({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get user profile
exports.profile = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).send({ error: 'Database is unavailable. Please try again shortly.' });
  }
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
