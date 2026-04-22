const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// Protected routes
router.post('/consent', auth, authController.recordConsent);
router.get('/profile', auth, authController.getProfile);
router.post('/consent', auth, authController.recordConsent);

module.exports = router;
