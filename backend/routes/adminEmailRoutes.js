const express = require('express');
const { body, validationResult } = require('express-validator');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
const Subscriber = require('../models/Subscriber');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const emailService = require('../services/emailService');
const newsletterScheduler = require('../services/newsletterScheduler');
const handlebars = require('handlebars');
const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// Validation middleware
const validateTemplate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Template name is required'),
  body('type')
    .isIn(['order-confirmation', 'order-completion', 'newsletter', 'custom'])
    .withMessage('Invalid template type'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('htmlContent')
    .trim()
    .notEmpty()
    .withMessage('HTML content is required')
];

// @route   GET /api/admin/email-templates
// @desc    Get all email templates
// @access  Private (Admin only)
router.get('/templates', async (req, res) => {
  try {
    const { type, isActive, search, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [templates, total] = await Promise.all([
      EmailTemplate.find(filter)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EmailTemplate.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email templates'
    });
  }
});

// @route   GET /api/admin/email-templates/:id
// @desc    Get single email template
// @access  Private (Admin only)
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email template'
    });
  }
});

// @route   POST /api/admin/email-templates
// @desc    Create new email template
// @access  Private (Admin only)
router.post('/templates', validateTemplate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, type, subject, htmlContent, textContent, variables, tags } = req.body;

    // Check if template name already exists
    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Template with this name already exists'
      });
    }

    const template = new EmailTemplate({
      name,
      type,
      subject,
      htmlContent,
      textContent,
      variables: variables || [],
      tags: tags || [],
      createdBy: req.user._id
    });

    await template.save();
    await template.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: { template }
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create email template'
    });
  }
});

// @route   PUT /api/admin/email-templates/:id
// @desc    Update email template
// @access  Private (Admin only)
router.put('/templates/:id', validateTemplate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, type, subject, htmlContent, textContent, variables, tags, isActive } = req.body;

    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    // Check if name is being changed and already exists
    if (name !== template.name) {
      const existingTemplate = await EmailTemplate.findOne({ name, _id: { $ne: req.params.id } });
      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: 'Template with this name already exists'
        });
      }
    }

    // Update template
    template.name = name;
    template.type = type;
    template.subject = subject;
    template.htmlContent = htmlContent;
    template.textContent = textContent;
    template.variables = variables || [];
    template.tags = tags || [];
    template.lastModifiedBy = req.user._id;
    if (isActive !== undefined) template.isActive = isActive;
    template.version += 1;

    await template.save();
    await template.populate(['createdBy', 'lastModifiedBy'], 'name email');

    res.json({
      success: true,
      message: 'Email template updated successfully',
      data: { template }
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email template'
    });
  }
});

// @route   DELETE /api/admin/email-templates/:id
// @desc    Delete email template
// @access  Private (Admin only)
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    await EmailTemplate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete email template'
    });
  }
});

// @route   POST /api/admin/email-templates/:id/preview
// @desc    Preview email template with sample data
// @access  Private (Admin only)
router.post('/templates/:id/preview', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    const { sampleData = {} } = req.body;

    // Generate default sample data based on template type
    let defaultData = {};
    switch (template.type) {
      case 'order-confirmation':
        defaultData = {
          customerName: 'John Doe',
          orderNumber: 'ORD-2025-001',
          orderDate: new Date().toLocaleDateString('en-IN'),
          orderTime: new Date().toLocaleTimeString('en-IN'),
          items: [
            { name: 'Grilled Chicken Salad', quantity: 1, price: '₹299', total: '₹299' },
            { name: 'Fresh Orange Juice', quantity: 2, price: '₹99', total: '₹198' }
          ],
          subtotal: '₹497',
          total: '₹497',
          deliveryAddress: '123 Main Street, Delhi, India',
          estimatedDeliveryTime: '45 minutes',
          restaurantName: 'EatFreshly',
          restaurantPhone: '+91 9876543210',
          restaurantEmail: 'support@healthyrestaurant.com'
        };
        break;
      case 'order-completion':
        defaultData = {
          customerName: 'Jane Smith',
          orderNumber: 'ORD-2025-002',
          completionDate: new Date().toLocaleDateString('en-IN'),
          completionTime: new Date().toLocaleTimeString('en-IN'),
          items: [
            { name: 'Quinoa Bowl', quantity: 1 },
            { name: 'Green Smoothie', quantity: 1 }
          ],
          total: '₹399',
          deliveryAddress: '456 Food Street, Mumbai, India',
          isDelivery: true,
          restaurantName: 'EatFreshly',
          restaurantPhone: '+91 9876543210'
        };
        break;
      case 'newsletter':
        defaultData = {
          subscriberName: 'Valued Customer',
          weekNumber: new Date().getWeek(),
          currentDate: new Date().toLocaleDateString('en-IN'),
          featuredItems: [
            { name: 'Mediterranean Bowl', description: 'Fresh and healthy', price: 299, icon: '🥗' }
          ],
          promotions: [
            { title: '20% OFF First Order', description: 'New customer special', code: 'WELCOME20' }
          ],
          upcomingMenus: [
            { day: 'Monday', items: [{ name: 'Caesar Salad', price: 199 }] }
          ],
          restaurantName: 'EatFreshly',
          websiteUrl: 'http://localhost:3000'
        };
        break;
      default:
        defaultData = {
          name: 'Customer Name',
          email: 'customer@example.com',
          date: new Date().toLocaleDateString('en-IN'),
          restaurantName: 'EatFreshly'
        };
    }

    const mergedData = { ...defaultData, ...sampleData };

    // Compile template
    const compiledTemplate = handlebars.compile(template.htmlContent);
    const htmlContent = compiledTemplate(mergedData);

    // Compile subject
    const compiledSubject = handlebars.compile(template.subject);
    const subject = compiledSubject(mergedData);

    res.json({
      success: true,
      data: {
        subject,
        htmlContent,
        sampleData: mergedData
      }
    });
  } catch (error) {
    console.error('Error previewing email template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview email template'
    });
  }
});

// @route   POST /api/admin/email-templates/:id/test
// @desc    Send test email using template
// @access  Private (Admin only)
router.post('/templates/:id/test', [
  body('testEmail').isEmail().withMessage('Valid test email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { testEmail, sampleData = {} } = req.body;

    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }

    // Use preview data generation
    const previewResponse = await router.handle({ 
      params: { id: req.params.id }, 
      body: { sampleData } 
    });

    const result = await emailService.sendEmail({
      to: { email: testEmail, name: 'Test User' },
      subject: `[TEST] ${template.subject}`,
      htmlContent: previewResponse.data.htmlContent,
      tags: ['test-email', template.type]
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: { messageId: result.messageId }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email'
    });
  }
});

// @route   GET /api/admin/email-stats
// @desc    Get email statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const { days = 30, templateType } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let filter = { createdAt: { $gte: startDate } };
    if (templateType) filter.templateType = templateType;

    const [emailStats, subscriberStats] = await Promise.all([
      EmailLog.getEmailStats(filter),
      Subscriber.aggregate([
        {
          $group: {
            _id: null,
            totalSubscribers: { $sum: 1 },
            activeSubscribers: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            newSubscribers: {
              $sum: {
                $cond: [
                  { $gte: ['$subscribedDate', startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const recentEmails = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('recipient.email subject templateType status createdAt');

    res.json({
      success: true,
      data: {
        email: emailStats[0] || {
          totalSent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          complained: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0
        },
        subscribers: subscriberStats[0] || {
          totalSubscribers: 0,
          activeSubscribers: 0,
          newSubscribers: 0
        },
        recentEmails
      }
    });
  } catch (error) {
    console.error('Error fetching email stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics'
    });
  }
});

// @route   GET /api/admin/subscribers
// @desc    Get all subscribers
// @access  Private (Admin only)
router.get('/subscribers', async (req, res) => {
  try {
    const { isActive, search, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [subscribers, total] = await Promise.all([
      Subscriber.find(filter)
        .select('-unsubscribeToken -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Subscriber.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
});

// @route   POST /api/admin/newsletter/send-test
// @desc    Send test newsletter
// @access  Private (Admin only)
router.post('/newsletter/send-test', [
  body('email').optional().isEmail().withMessage('Valid email required for test')
], async (req, res) => {
  try {
    const { email } = req.body;

    const results = await newsletterScheduler.sendTestNewsletter(email);

    res.json({
      success: true,
      message: 'Test newsletter sent successfully',
      data: { results }
    });
  } catch (error) {
    console.error('Error sending test newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test newsletter'
    });
  }
});

// @route   GET /api/admin/newsletter/stats
// @desc    Get newsletter statistics
// @access  Private (Admin only)
router.get('/newsletter/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await newsletterScheduler.getNewsletterStats(parseInt(days));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics'
    });
  }
});

module.exports = router;
