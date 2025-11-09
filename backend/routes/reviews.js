const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Validation middleware
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters'),
  body('menuItems')
    .optional()
    .isArray()
    .withMessage('Menu items must be an array'),
  body('menuItems.*.menuItemId')
    .optional()
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  body('menuItems.*.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Menu item rating must be between 1 and 5')
];

// @route   POST /api/reviews
// @desc    Create a new review for an order
// @access  Private
router.post('/', authenticateToken, validateReview, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, rating, comment, menuItems, isAnonymous } = req.body;

    // Check if order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
      status: 'Delivered' // Only allow reviews for delivered orders
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not delivered yet'
      });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({
      userId: req.user._id,
      orderId: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order'
      });
    }

    // Create review
    const review = new Review({
      userId: req.user._id,
      orderId,
      rating,
      comment,
      menuItems: menuItems || [],
      isAnonymous: isAnonymous || false
    });

    await review.save();

    // Populate review data for response
    await review.populate([
      {
        path: 'userId',
        select: 'name'
      },
      {
        path: 'orderId',
        select: 'orderNumber totalPrice items',
        populate: {
          path: 'items.menuItemId',
          select: 'name imageUrl'
        }
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
});

// @route   GET /api/reviews
// @desc    Get reviews with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      isHighlighted,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    let filter = { isApproved: true };
    
    if (rating) {
      filter.rating = parseInt(rating);
    }
    
    if (isHighlighted === 'true') {
      filter.isHighlighted = true;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate([
          {
            path: 'userId',
            select: 'name'
          },
          {
            path: 'orderId',
            select: 'orderNumber createdAt'
          }
        ]),
      Review.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// @route   GET /api/reviews/top
// @desc    Get top 5 reviews for homepage carousel
// @access  Public
router.get('/top', async (req, res) => {
  try {
    const topReviews = await Review.find({
      isApproved: true,
      rating: { $gte: 4 } // Only 4+ star reviews
    })
      .sort({ 
        isHighlighted: -1, // Highlighted reviews first
        rating: -1,        // Then by rating
        helpfulCount: -1,  // Then by helpful count
        createdAt: -1      // Then by newest
      })
      .limit(5)
      .populate([
        {
          path: 'userId',
          select: 'name'
        },
        {
          path: 'orderId',
          select: 'orderNumber createdAt items',
          populate: {
            path: 'items.menuItemId',
            select: 'name imageUrl'
          }
        }
      ]);

    res.json({
      success: true,
      data: { reviews: topReviews }
    });
  } catch (error) {
    console.error('Get top reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching top reviews'
    });
  }
});

// @route   GET /api/reviews/user
// @desc    Get user's reviews
// @access  Private
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate([
          {
            path: 'orderId',
            select: 'orderNumber totalPrice createdAt items',
            populate: {
              path: 'items.menuItemId',
              select: 'name imageUrl'
            }
          }
        ]),
      Review.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews'
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get single review
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate([
        {
          path: 'userId',
          select: 'name'
        },
        {
          path: 'orderId',
          select: 'orderNumber totalPrice createdAt items',
          populate: {
            path: 'items.menuItemId',
            select: 'name imageUrl'
          }
        }
      ]);

    if (!review || !review.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update user's review
// @access  Private
router.put('/:id', authenticateToken, validateReview, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment, menuItems, isAnonymous } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;
    review.menuItems = menuItems || [];
    review.isAnonymous = isAnonymous || false;

    await review.save();

    // Populate updated review
    await review.populate([
      {
        path: 'userId',
        select: 'name'
      },
      {
        path: 'orderId',
        select: 'orderNumber totalPrice items',
        populate: {
          path: 'items.menuItemId',
          select: 'name imageUrl'
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete user's review
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
});

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.put('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review || !review.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.helpfulCount += 1;
    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { helpfulCount: review.helpfulCount }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking review as helpful'
    });
  }
});

// Admin routes

// @route   GET /api/reviews/admin/all
// @desc    Get all reviews for admin (including unapproved)
// @access  Private (Admin)
router.get('/admin/all', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, isApproved, rating } = req.query;

    let filter = {};
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }
    if (rating) {
      filter.rating = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate([
          {
            path: 'userId',
            select: 'name email'
          },
          {
            path: 'orderId',
            select: 'orderNumber totalPrice createdAt'
          }
        ]),
      Review.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// @route   PUT /api/reviews/admin/:id/approve
// @desc    Approve/disapprove review
// @access  Private (Admin)
router.put('/admin/:id/approve', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: isApproved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'disapproved'} successfully`,
      data: { review }
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review approval'
    });
  }
});

// @route   PUT /api/reviews/admin/:id/highlight
// @desc    Highlight/unhighlight review for homepage
// @access  Private (Admin)
router.put('/admin/:id/highlight', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { isHighlighted } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isHighlighted: isHighlighted },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: `Review ${isHighlighted ? 'highlighted' : 'unhighlighted'} successfully`,
      data: { review }
    });
  } catch (error) {
    console.error('Highlight review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review highlight status'
    });
  }
});

module.exports = router;
