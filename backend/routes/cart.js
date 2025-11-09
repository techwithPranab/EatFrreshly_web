const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Validation middleware
const validateCartItem = [
  body('menuItemId')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  body('quantity')
    .isInt({ min: 1, max: 20 })
    .withMessage('Quantity must be between 1 and 20')
];

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate({
        path: 'items.menuItemId',
        select: 'name price imageUrl category isAvailable'
      });

    if (!cart) {
      return res.json({
        success: true,
        data: {
          cart: { items: [], totalItems: 0 },
          totalPrice: 0
        }
      });
    }

    // Filter out unavailable items and calculate total
    const availableItems = cart.items.filter(item => 
      item.menuItemId && item.menuItemId.isAvailable
    );

    const totalPrice = availableItems.reduce((total, item) => {
      return total + (item.menuItemId.price * item.quantity);
    }, 0);

    // Update cart if items were removed
    if (availableItems.length !== cart.items.length) {
      cart.items = availableItems;
      await cart.save();
    }

    res.json({
      success: true,
      data: {
        cart: {
          ...cart.toObject(),
          items: availableItems,
          totalItems: cart.totalItems
        },
        totalPrice: totalPrice.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', authenticateToken, validateCartItem, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { menuItemId, quantity } = req.body;

    // Check if menu item exists and is available
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or not available'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItemId.toString() === menuItemId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > 20) {
        return res.status(400).json({
          success: false,
          message: 'Maximum quantity per item is 20'
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ menuItemId, quantity });
    }

    await cart.save();
    
    // Populate and return updated cart
    await cart.populate({
      path: 'items.menuItemId',
      select: 'name price imageUrl category'
    });

    const totalPrice = cart.items.reduce((total, item) => {
      return total + (item.menuItemId.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart,
        totalPrice: totalPrice.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart'
    });
  }
});

// @route   PUT /api/cart/update/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:itemId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;

    if (!quantity || quantity < 1 || quantity > 20) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 20'
      });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate and return updated cart
    await cart.populate({
      path: 'items.menuItemId',
      select: 'name price imageUrl category'
    });

    const totalPrice = cart.items.reduce((total, item) => {
      return total + (item.menuItemId.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        cart,
        totalPrice: totalPrice.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart'
    });
  }
});

// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    // Populate and return updated cart
    if (cart.items.length > 0) {
      await cart.populate({
        path: 'items.menuItemId',
        select: 'name price imageUrl category'
      });
    }

    const totalPrice = cart.items.reduce((total, item) => {
      return total + (item.menuItemId.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart,
        totalPrice: totalPrice.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: { items: [], totalItems: 0 },
        totalPrice: 0
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
});

module.exports = router;
