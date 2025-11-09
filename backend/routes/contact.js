const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const ContactInfo = require('../models/ContactInfo');
const emailService = require('../services/emailService');
const router = express.Router();

// @route   GET /api/contact/info
// @desc    Get restaurant contact information
// @access  Public
router.get('/info', async (req, res) => {
  try {
    const contactInfo = await ContactInfo.getContactInfo();
    res.status(200).json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information'
    });
  }
});

// Validation middleware for contact form
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('inquiryType')
    .optional()
    .isIn(['general', 'order', 'delivery', 'feedback', 'partnership', 'other'])
    .withMessage('Invalid inquiry type')
];

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', validateContactForm, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message, inquiryType = 'general' } = req.body;

    // Create new contact submission
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      inquiryType,
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await contact.save();

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmation(contact);
      contact.confirmationSent = true;
      await contact.save();
    } catch (emailError) {
      console.error('Contact confirmation email failed:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await emailService.sendContactNotification(contact);
    } catch (emailError) {
      console.error('Contact notification email failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We\'ll get back to you within 24 hours.',
      data: {
        contactId: contact._id,
        inquiryType: contact.inquiryType
      }
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.'
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper authentication middleware)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied. Admin privileges required.'
    //   });
    // }

    const stats = await Contact.getStats();

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact statistics'
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact submissions
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper authentication middleware)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied. Admin privileges required.'
    //   });
    // }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const inquiryType = req.query.inquiryType;
    const isRead = req.query.isRead;

    const query = {};
    if (status) query.status = status;
    if (inquiryType) query.inquiryType = inquiryType;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact submissions'
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact submission
// @access  Private (Admin only)
router.get('/:id', async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper authentication middleware)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied. Admin privileges required.'
    //   });
    // }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    // Mark as read if not already read
    if (!contact.isRead) {
      await contact.markAsRead();
    }

    res.json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact submission'
    });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact status
// @access  Private (Admin only)
router.put('/:id/status', [
  body('status')
    .isIn(['new', 'in-progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper authentication middleware)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied. Admin privileges required.'
    //   });
    // }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await contact.updateStatus(status, adminNotes);

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: { contact }
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status'
    });
  }
});

// @route   PUT /api/contact/:id/confirm
// @desc    Confirm user receipt of contact submission
// @access  Public
router.put('/:id/confirm', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await contact.confirmUserReceipt();

    res.json({
      success: true,
      message: 'Contact submission confirmed successfully',
      data: { contact }
    });
  } catch (error) {
    console.error('Confirm contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm contact submission'
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is admin (you might want to add proper authentication middleware)
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({
      //     success: false,
      //     message: 'Access denied. Admin privileges required.'
      //   });
    // }

    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission'
    });
  }
});

module.exports = router;
