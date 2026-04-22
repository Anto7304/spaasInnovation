const express = require('express');
const router = express.Router();
const intakeController = require('../controllers/intakeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All intake routes require authentication
router.use(auth);

// User routes
router.post('/', intakeController.submitIntake);
router.get('/', intakeController.getIntake);
router.get('/status', intakeController.getIntakeStatus);
router.put('/', intakeController.updateIntake);

// Admin routes (require admin role)
router.get('/admin/all', authorize('admin'), intakeController.getAllIntakes);
router.put('/admin/:intakeId/evaluate', authorize('admin'), intakeController.evaluateIntake);
router.get('/admin/stats', authorize('admin'), intakeController.getIntakeStats);

module.exports = router;
