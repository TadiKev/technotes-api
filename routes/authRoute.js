const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');

// POST /auth - Login route
router.route('/')
    .post(loginLimiter, authController.login);

// GET /auth/refresh - Refresh access token route
router.route('/refresh')
    .get(authController.refresh);

// POST /auth/signup - Signup route
router.route('/signup')
    .post(authController.signup);

// POST /auth/logout - Logout route
router.route('/logout')
    .post(authController.logout);

module.exports = router;
