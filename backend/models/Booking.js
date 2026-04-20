const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must have a user'],
    },
    sessionType: {
      type: String,
      enum: ['individual', 'group', 'workshop'],
      required: [true, 'Please specify session type'],
    },
    price: {
      type: Number,
      default: 200, // Default price in KSh
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but unique when present
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
