const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const { validateBooking, handleValidationErrors } = require('../middleware/validation');

// Protected routes - All booking routes require authentication
router.post('/', auth, validateBooking, handleValidationErrors, bookingController.createBooking);
router.get('/history', auth, bookingController.getBookingHistory);
router.get('/:bookingId', auth, bookingController.getBookingById);
router.put('/:bookingId/payment', auth, bookingController.updatePaymentStatus);
router.delete('/:bookingId', auth, bookingController.cancelBooking);

module.exports = router;
