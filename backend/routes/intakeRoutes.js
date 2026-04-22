const express = require('express');
const router = express.Router();
const intakeController = require('../controllers/intakeController');
const auth = require('../middleware/auth');

// All intake routes require authentication
router.use(auth);

// Routes
router.post('/', intakeController.submitIntake);
router.get('/', intakeController.getIntake);
router.get('/status', intakeController.getIntakeStatus);
router.put('/', intakeController.updateIntake);

module.exports = router;
