const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve reviews, can be changed for moderation
  },
  isHighlighted: {
    type: Boolean,
    default: false // For featuring reviews on homepage
  },
  menuItems: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ isApproved: 1, isHighlighted: 1 });

module.exports = mongoose.model('Review', reviewSchema);
