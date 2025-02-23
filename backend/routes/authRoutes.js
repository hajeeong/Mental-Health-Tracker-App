const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route - POST /api/auth/register
router.post('/register', authController.register);

// Login route - POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;