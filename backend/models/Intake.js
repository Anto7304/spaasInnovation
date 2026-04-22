const mongoose = require('mongoose');

const intakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [16, 'Age must be at least 16'],
      max: [100, 'Age cannot exceed 100'],
    },
    yearOfStudy: {
      type: String,
      required: [true, 'Year of study is required'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Other'],
    },
    program: {
      type: String,
      required: [true, 'Program is required'],
      trim: true,
      maxlength: [200, 'Program cannot exceed 200 characters'],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    // Admin evaluation fields
    evaluationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'needs_followup', 'rejected'],
      default: 'pending',
    },
    priorityLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    evaluationNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Evaluation notes cannot exceed 1000 characters'],
    },
    recommendations: {
      type: String,
      trim: true,
      maxlength: [500, 'Recommendations cannot exceed 500 characters'],
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    evaluatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
intakeSchema.index({ evaluationStatus: 1, priorityLevel: 1 });
intakeSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Intake', intakeSchema);
