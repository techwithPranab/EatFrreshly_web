const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Validation middleware
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please enter a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Street address must be between 1 and 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Zip code must be between 1 and 20 characters')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, address } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, validatePasswordChange, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account (soft delete)
// @access  Private
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating account'
    });
  }
});

// @route   GET /api/users/dashboard-stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Review = require('../models/Review');
    
    const [totalOrders, pendingOrders, deliveredOrders] = await Promise.all([
      Order.countDocuments({ userId: req.user._id }),
      Order.countDocuments({ 
        userId: req.user._id, 
        status: { $in: ['Placed', 'Preparing', 'Out for Delivery'] }
      }),
      Order.countDocuments({ 
        userId: req.user._id, 
        status: 'Delivered' 
      })
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.menuItemId', 'name imageUrl');

    // Calculate total spent
    const totalSpentResult = await Order.aggregate([
      {
        $match: { 
          userId: req.user._id,
          status: 'Delivered'
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].totalSpent : 0;

    // Get user's average rating from reviews
    const userReviews = await Review.find({ userId: req.user._id });
    const averageRating = userReviews.length > 0 
      ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
      : 0;

    // Get favorite category based on most ordered items
    const favoriteCategoryResult = await Order.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItemId',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $group: {
          _id: '$menuItem.category',
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const favoriteCategory = favoriteCategoryResult.length > 0 ? favoriteCategoryResult[0]._id : 'Not available';

    // Get favorite item based on most ordered items
    const favoriteItemResult = await Order.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: '$menuItem' },
      {
        $project: {
          name: '$menuItem.name'
        }
      }
    ]);

    const favoriteItem = favoriteItemResult.length > 0 ? favoriteItemResult[0].name : 'Not available';

    // Get last order date
    const lastOrder = await Order.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const lastOrderDate = lastOrder ? lastOrder.createdAt : null;

    // Calculate loyalty points (example: 10 points per order)
    const loyaltyPoints = totalOrders * 10;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        favoriteCategory,
        favoriteItem,
        averageRating: parseFloat(averageRating.toFixed(1)),
        lastOrderDate,
        loyaltyPoints
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
});

module.exports = router;
