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
