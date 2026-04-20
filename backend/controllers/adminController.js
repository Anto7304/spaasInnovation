const Booking = require('../models/Booking');
const User = require('../models/User');
const Resource = require('../models/Resource');

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, userId } = req.query;

    let filter = {};

    if (status) {
      filter.paymentStatus = status;
    }

    if (userId) {
      filter.user = userId;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message,
    });
  }
};

// Get analytics summary
exports.getAnalytics = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalResources = await Resource.countDocuments();

    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingsByType = await Booking.aggregate([
      {
        $group: {
          _id: '$sessionType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
        },
      },
    ]);

    const totalRevenue = await Booking.aggregate([
      {
        $match: { paymentStatus: 'completed' },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' },
        },
      },
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      analytics: {
        totalBookings,
        totalUsers,
        totalResources,
        totalRevenue: totalRevenue[0]?.total || 0,
        bookingsByStatus,
        bookingsByType,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

// Manage users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message,
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete user and related bookings
    await User.findByIdAndDelete(userId);
    await Booking.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: 'User and related data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus } = req.body;

    if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus },
      { new: true }
    ).populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message,
    });
  }
};

// Privacy policy endpoint
exports.getPrivacyPolicy = (req, res) => {
  res.status(200).json({
    success: true,
    policy: {
      title: 'Privacy Policy - Smash&Heal',
      lastUpdated: new Date().toISOString(),
      content: `
        We are committed to protecting your privacy. This privacy policy explains how we collect, use, and safeguard your information.
        
        1. Information Collection
        - We collect personal information (name, email, password) during registration
        - Booking information is collected when you schedule sessions
        - Session data and payment information is securely stored
        
        2. Data Usage
        - Your data is used to provide our mental health services
        - We use analytics to improve our services
        - We do not share personal information with third parties without consent
        
        3. Data Security
        - Passwords are encrypted using bcryptjs
        - All communications are secured with JWT tokens
        - We comply with data protection standards
        
        4. Your Rights
        - You can request access to your data
        - You can request deletion of your account and data
        - Contact us for any privacy concerns
        
        5. Contact
        For privacy inquiries, contact: privacy@smashandhealmh.com
      `,
    },
  });
};

// M-PESA Daraja API placeholder for STK push
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { bookingId, phoneNumber } = req.body;

    if (!bookingId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and phoneNumber',
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // This is a placeholder for M-PESA integration
    // In production, you would:
    // 1. Generate M-PESA authentication token
    // 2. Call the M-PESA Daraja API with STK push endpoint
    // 3. Handle callback from M-PESA
    // 4. Update booking payment status

    const mpesaResponse = {
      success: true,
      message: 'M-PESA STK push initiated (placeholder)',
      bookingId,
      amount: booking.price,
      phoneNumber,
      status: 'pending',
      nextSteps: 'In production, M-PESA prompt will appear on the user\'s phone',
      callbackUrl: '/api/mpesa/callback',
    };

    res.status(200).json(mpesaResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initiating M-PESA payment',
      error: error.message,
    });
  }
};

// M-PESA Callback handler (placeholder)
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { MerchantRequestID, CheckoutRequestID, ResultCode } = stkCallback;

    // Log callback for debugging
    console.log('M-PESA Callback received:', stkCallback);

    // ResultCode 0 means success
    if (ResultCode === 0) {
      // Extract payment details and update booking
      console.log('Payment successful:', CheckoutRequestID);

      res.status(200).json({
        success: true,
        message: 'Callback processed',
        checkoutRequestID: CheckoutRequestID,
      });
    } else {
      console.log('Payment failed with code:', ResultCode);

      res.status(200).json({
        success: false,
        message: 'Payment failed',
        resultCode: ResultCode,
      });
    }
  } catch (error) {
    console.error('Error processing M-PESA callback:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing callback',
      error: error.message,
    });
  }
};
