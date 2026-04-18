const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const authMiddleware = require('../../middlewares/auth');

// Define the user-related routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);
router.get('/user-details', authMiddleware, userController.profile);

module.exports = router;
