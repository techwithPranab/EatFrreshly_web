const express = require('express');
const { body, validationResult, query } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

// Validation middleware
const validateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('category')
    .isIn(['Starters', 'Main Course', 'Salads', 'Drinks', 'Desserts'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('imageUrl')
    .isURL()
    .withMessage('Please provide a valid image URL')
];

// @route   GET /api/menu
// @desc    Get all menu items with filtering and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      isVegetarian,
      isVegan,
      isGlutenFree,
      isSignature,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    let filter = { isAvailable: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (isVegetarian === 'true') {
      filter.isVegetarian = true;
    }

    if (isVegan === 'true') {
      filter.isVegan = true;
    }

    if (isGlutenFree === 'true') {
      filter.isGlutenFree = true;
    }

    if (isSignature === 'true') {
      filter.isSignature = true;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      MenuItem.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      MenuItem.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        items,
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
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu items'
    });
  }
});

// @route   GET /api/menu/categories
// @desc    Get all menu categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', { isAvailable: true });
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: { item }
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu item'
    });
  }
});

// @route   POST /api/menu
// @desc    Create new menu item (Admin only)
// @access  Private (Admin)
router.post('/', 
  authenticateToken, 
  authorizeRole(['admin']), 
  validateMenuItem, 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const item = new MenuItem(req.body);
      await item.save();

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: { item }
      });
    } catch (error) {
      console.error('Create menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating menu item'
      });
    }
  }
);

// @route   PUT /api/menu/:id
// @desc    Update menu item (Admin only)
// @access  Private (Admin)
router.put('/:id', 
  authenticateToken, 
  authorizeRole(['admin']), 
  validateMenuItem, 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const item = await MenuItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: { item }
      });
    } catch (error) {
      console.error('Update menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating menu item'
      });
    }
  }
);

// @route   DELETE /api/menu/:id
// @desc    Delete menu item (Admin only)
// @access  Private (Admin)
router.delete('/:id', 
  authenticateToken, 
  authorizeRole(['admin']), 
  async (req, res) => {
    try {
      const item = await MenuItem.findByIdAndDelete(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      console.error('Delete menu item error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting menu item'
      });
    }
  }
);

module.exports = router;
