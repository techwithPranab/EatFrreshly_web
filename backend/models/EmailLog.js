const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    name: String
  },
  sender: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    name: String
  },
  subject: {
    type: String,
    required: true
  },
  templateType: {
    type: String,
    enum: ['order-confirmation', 'order-completion', 'newsletter', 'custom'],
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  emailProvider: {
    type: String,
    enum: ['brevo', 'sendgrid', 'mailgun', 'ses'],
    default: 'brevo'
  },
  providerMessageId: {
    type: String
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed'],
    default: 'sent'
  },
  error: {
    code: String,
    message: String
  },
  metadata: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscriber'
    },
    campaignId: String,
    tags: [String]
  },
  events: [{
    type: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: {
      type: Map,
      of: String
    }
  }],
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
emailLogSchema.index({ 'recipient.email': 1, createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ templateType: 1, createdAt: -1 });
emailLogSchema.index({ providerMessageId: 1 });
emailLogSchema.index({ 'metadata.orderId': 1 });
emailLogSchema.index({ 'metadata.subscriberId': 1 });

// Methods
emailLogSchema.methods.addEvent = function(eventType, data = {}) {
  this.events.push({
    type: eventType,
    data: data
  });
  
  // Update status and timestamps
  if (eventType === 'delivered') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
  } else if (eventType === 'opened') {
    this.status = 'opened';
    this.openedAt = new Date();
  } else if (eventType === 'clicked') {
    this.status = 'clicked';
    this.clickedAt = new Date();
  } else if (['bounced', 'complained'].includes(eventType)) {
    this.status = eventType;
  }
  
  return this.save();
};

// Static methods
emailLogSchema.statics.getEmailStats = function(filter = {}) {
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0] } },
        opened: { $sum: { $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } },
        bounced: { $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] } },
        complained: { $sum: { $cond: [{ $eq: ['$status', 'complained'] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        deliveryRate: { $multiply: [{ $divide: ['$delivered', '$totalSent'] }, 100] },
        openRate: { $multiply: [{ $divide: ['$opened', '$delivered'] }, 100] },
        clickRate: { $multiply: [{ $divide: ['$clicked', '$opened'] }, 100] },
        bounceRate: { $multiply: [{ $divide: ['$bounced', '$totalSent'] }, 100] }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('EmailLog', emailLogSchema);
