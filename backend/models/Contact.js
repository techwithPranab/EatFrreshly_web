const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxLength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxLength: [2000, 'Message cannot exceed 2000 characters']
  },
  inquiryType: {
    type: String,
    enum: ['general', 'order', 'delivery', 'feedback', 'partnership', 'other'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  responseSent: {
    type: Boolean,
    default: false
  },
  responseDate: {
    type: Date
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String,
    trim: true
  },
  userConfirmed: {
    type: Boolean,
    default: false
  },
  confirmationDate: {
    type: Date
  },
  source: {
    type: String,
    enum: ['website', 'mobile', 'email', 'phone'],
    default: 'website'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ inquiryType: 1 });

// Virtual for response time calculation
contactSchema.virtual('responseTime').get(function() {
  if (this.responseDate && this.createdAt) {
    return Math.floor((this.responseDate.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60)); // hours
  }
  return null;
});

// Method to mark as read
contactSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to update status
contactSchema.methods.updateStatus = function(status, adminNotes = null) {
  this.status = status;
  if (adminNotes) {
    this.adminNotes = adminNotes;
  }
  if (status === 'resolved' || status === 'closed') {
    this.responseSent = true;
    this.responseDate = new Date();
  }
  return this.save();
};

// Method to confirm user receipt
contactSchema.methods.confirmUserReceipt = function() {
  this.userConfirmed = true;
  this.confirmationDate = new Date();
  return this.save();
};

// Static method to get contact statistics
contactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    unread: 0
  };
};

module.exports = mongoose.model('Contact', contactSchema);
