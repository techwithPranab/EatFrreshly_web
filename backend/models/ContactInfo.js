const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxLength: [500, 'Address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  businessHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '22:00' },
      closed: { type: Boolean, default: true }
    }
  },
  socialMedia: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  additionalInfo: {
    type: String,
    trim: true,
    maxLength: [1000, 'Additional info cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Ensure only one document exists
contactInfoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existing = await this.constructor.findOne();
    if (existing) {
      const error = new Error('Only one contact info document is allowed');
      return next(error);
    }
  }
  next();
});

// Static method to get the contact info (should only be one)
contactInfoSchema.statics.getContactInfo = async function() {
  let contactInfo = await this.findOne();
  if (!contactInfo) {
    // Create default contact info if none exists
    contactInfo = new this({
      address: '123 Restaurant Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@healthyretaurant.com',
      businessHours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: true }
      },
      socialMedia: {
        facebook: 'https://facebook.com/healthyretaurant',
        instagram: 'https://instagram.com/healthyretaurant',
        twitter: 'https://twitter.com/healthyretaurant'
      },
      additionalInfo: 'We serve fresh, healthy meals made with organic ingredients.'
    });
    await contactInfo.save();
  }
  return contactInfo;
};

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
