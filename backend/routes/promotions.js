const express = require('express');
const { body, validationResult } = require('express-validator');
const Promotion = require('../models/Promotion');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/promotions
// @desc    Get all active promotions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    
    const promotions = await Promotion.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { promotions }
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching promotions'
    });
  }
});

// @route   GET /api/promotions/:id
// @desc    Get single promotion details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      data: { promotion }
    });
  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching promotion'
    });
  }
});

// @route   POST /api/promotions/validate
// @desc    Validate promo code
// @access  Private
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { promoCode, orderAmount } = req.body;

    if (!promoCode) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const now = new Date();
    const promotion = await Promotion.findOne({
      promoCode: promoCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check minimum order amount
    if (orderAmount < promotion.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of $${promotion.minimumOrderAmount} required`
      });
    }

    // Calculate discount
    let discountAmount = (orderAmount * promotion.discountPercent) / 100;
    
    // Apply maximum discount limit if set
    if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
      discountAmount = promotion.maxDiscountAmount;
    }

    res.json({
      success: true,
      message: 'Promo code is valid',
      data: {
        promotion: {
          _id: promotion._id,
          title: promotion.title,
          discountPercent: promotion.discountPercent,
          promoCode: promotion.promoCode
        },
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat((orderAmount - discountAmount).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while validating promo code'
    });
  }
});

// Admin routes

// @route   GET /api/promotions/admin/all
// @desc    Get all promotions (Admin only)
// @access  Private (Admin)
router.get('/admin/all', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;

    let filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [promotions, total] = await Promise.all([
      Promotion.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Promotion.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        promotions,
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
    console.error('Get all promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching promotions'
    });
  }
});

// @route   POST /api/promotions/admin
// @desc    Create new promotion (Admin only)
// @access  Private (Admin)
router.post('/admin', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: { promotion }
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating promotion'
    });
  }
});

// @route   PUT /api/promotions/admin/:id
// @desc    Update promotion (Admin only)
// @access  Private (Admin)
router.put('/admin/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: { promotion }
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating promotion'
    });
  }
});

// @route   DELETE /api/promotions/admin/:id
// @desc    Delete promotion (Admin only)
// @access  Private (Admin)
router.delete('/admin/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting promotion'
    });
  }
});

module.exports = router;
