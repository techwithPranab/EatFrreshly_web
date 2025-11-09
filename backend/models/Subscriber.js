const mongoose = require('mongoose');
const crypto = require('crypto');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedDate: {
    type: Date,
    default: Date.now
  },
  unsubscribedDate: {
    type: Date
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    orderUpdates: {
      type: Boolean,
      default: true
    },
    newMenuItems: {
      type: Boolean,
      default: true
    }
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  unsubscribeToken: {
    type: String,
    unique: true
  },
  source: {
    type: String,
    enum: ['website', 'order', 'manual', 'import'],
    default: 'website'
  },
  tags: [String],
  customFields: {
    type: Map,
    of: String
  },
  emailStats: {
    totalSent: {
      type: Number,
      default: 0
    },
    totalOpened: {
      type: Number,
      default: 0
    },
    totalClicked: {
      type: Number,
      default: 0
    },
    lastOpened: Date,
    lastClicked: Date
  }
}, {
  timestamps: true
});

// Generate unsubscribe token before saving
subscriberSchema.pre('save', function(next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Index for better query performance
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1, 'preferences.newsletter': 1 });
subscriberSchema.index({ unsubscribeToken: 1 });

// Methods
subscriberSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedDate = new Date();
  return this.save();
};

subscriberSchema.methods.updatePreferences = function(preferences) {
  this.preferences = { ...this.preferences, ...preferences };
  return this.save();
};

module.exports = mongoose.model('Subscriber', subscriberSchema);
