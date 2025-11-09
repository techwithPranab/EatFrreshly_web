const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
const emailService = require('../services/emailService');
const router = express.Router();

// Validation middleware
const validateSubscriber = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
];

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', validateSubscriber, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, name, phone, preferences = {}, source = 'website' } = req.body;

    // Check if subscriber already exists
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      if (subscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate if previously unsubscribed
        subscriber.isActive = true;
        subscriber.subscribedDate = new Date();
        subscriber.unsubscribedDate = undefined;
        if (name) subscriber.name = name;
        if (phone) subscriber.phone = phone;
        subscriber.preferences = { ...subscriber.preferences, ...preferences };
        await subscriber.save();
      }
    } else {
      // Create new subscriber
      subscriber = new Subscriber({
        email,
        name,
        phone,
        preferences: {
          newsletter: true,
          promotions: true,
          orderUpdates: true,
          newMenuItems: true,
          ...preferences
        },
        source
      });
      await subscriber.save();
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        subscriber: {
          email: subscriber.email,
          name: subscriber.name,
          preferences: subscriber.preferences
        }
      }
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter'
    });
  }
});

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', [
  body('email').optional().isEmail().normalizeEmail(),
  body('token').optional().isLength({ min: 32 })
], async (req, res) => {
  try {
    const { email, token } = req.body;

    let subscriber;
    if (token) {
      subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    } else if (email) {
      subscriber = await Subscriber.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Email or unsubscribe token is required'
      });
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    await subscriber.unsubscribe();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from newsletter'
    });
  }
});

// @route   PUT /api/newsletter/preferences
// @desc    Update subscription preferences
// @access  Public (with token) or Private
router.put('/preferences', [
  body('token').optional().isLength({ min: 32 }),
  body('preferences').isObject().withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    const { token, preferences } = req.body;

    let subscriber;
    if (token) {
      subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    } else if (req.user) {
      subscriber = await Subscriber.findOne({ email: req.user.email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Token or authentication required'
      });
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    await subscriber.updatePreferences(preferences);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: subscriber.preferences
      }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// @route   GET /api/newsletter/subscriber/:token
// @desc    Get subscriber details by token
// @access  Public
router.get('/subscriber/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const subscriber = await Subscriber.findOne({ 
      unsubscribeToken: token 
    }).select('-__v -emailStats');

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.json({
      success: true,
      data: { subscriber }
    });
  } catch (error) {
    console.error('Get subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriber details'
    });
  }
});

module.exports = router;
