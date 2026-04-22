const mongoose = require('mongoose');

const intakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One intake per user
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    age: {
      type: Number,
      required: [true, 'Please provide your age'],
      min: [16, 'Age must be at least 16'],
      max: [100, 'Please provide a valid age'],
    },
    yearOfStudy: {
      type: String,
      required: [true, 'Please provide your year of study'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Other'],
    },
    program: {
      type: String,
      required: [true, 'Please provide your program'],
      trim: true,
      maxlength: [200, 'Program name cannot exceed 200 characters'],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
intakeSchema.index({ user: 1 });

module.exports = mongoose.model('Intake', intakeSchema);
