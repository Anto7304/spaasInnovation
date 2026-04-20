const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['guide', 'pdf', 'video', 'article'],
      required: true,
    },
    fileLink: {
      type: String,
      required: [true, 'Please provide a file/video link'],
    },
    thumbnail: {
      type: String, // URL for video thumbnails
    },
    duration: {
      type: Number, // Duration in minutes for videos
    },
    author: {
      type: String,
      default: 'Smash&Heal Team',
    },
    tags: [
      {
        type: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
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
resourceSchema.index({ category: 1, isPublished: 1 });
resourceSchema.index({ tags: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
