const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All admin routes require authentication and admin role
router.use(auth, authorize('admin'));

// Bookings management
router.get('/bookings/all', adminController.getAllBookings);
router.put('/bookings/:bookingId/status', adminController.updateBookingStatus);

// Users management
router.get('/users/all', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Analytics
router.get('/analytics/summary', adminController.getAnalytics);

// Payment & M-PESA
router.post('/payments/mpesa', adminController.initiateMpesaPayment);
router.post('/payments/mpesa/callback', adminController.mpesaCallback);

// Privacy Policy
router.get('/privacy/policy', adminController.getPrivacyPolicy);

module.exports = router;
