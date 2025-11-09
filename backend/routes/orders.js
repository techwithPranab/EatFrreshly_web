const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const EmailLog = require('../models/EmailLog');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const emailService = require('../services/emailService');
const router = express.Router();

// Validation middleware
const validateOrder = [
  body('deliveryAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('deliveryAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('deliveryAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('deliveryAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('paymentMethod')
    .isIn(['Cash on Delivery', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Stripe'])
    .withMessage('Invalid payment method')
];

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
router.post('/', authenticateToken, validateOrder, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.menuItemId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate all items are still available and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.menuItemId || !item.menuItemId.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Item "${item.menuItemId?.name || 'Unknown'}" is no longer available`
        });
      }

      const itemTotal = item.menuItemId.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId._id,
        name: item.menuItemId.name,
        price: item.menuItemId.price,
        quantity: item.quantity
      });
    }

    // Calculate estimated delivery time (30-60 minutes)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(
      estimatedDeliveryTime.getMinutes() + Math.floor(Math.random() * 30) + 30
    );

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      estimatedDeliveryTime
    });

    await order.save();

    // Clear user's cart
    await Cart.findOneAndDelete({ userId: req.user._id });

    // Populate order with user details
    await order.populate('userId', 'name email phone');

    // Send order confirmation email
    console.log(`📧 Attempting to send order confirmation email for order ${order.orderNumber} to ${order.userId.email}`);
    try {
      const emailResult = await emailService.sendOrderConfirmation(
        {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          items: orderItems,
          subtotal: totalPrice,
          totalPrice,
          deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zipCode}`,
          estimatedDeliveryTime: order.estimatedDeliveryTime
        },
        {
          name: order.userId.name,
          email: order.userId.email
        }
      );

      console.log(`✅ Email service returned result:`, {
        success: emailResult.success,
        messageId: emailResult.messageId,
        hasError: !!emailResult.error
      });

      // Log email sending
      if (emailResult.success) {
        console.log(`✅ Order confirmation email sent successfully for order ${order.orderNumber} to ${order.userId.email}`);
        await new EmailLog({
          recipient: {
            email: order.userId.email,
            name: order.userId.name
          },
          sender: {
            email: process.env.EMAIL_SENDER_EMAIL || 'noreply@healthyrestaurant.com',
            name: process.env.EMAIL_SENDER_NAME || 'EatFreshly'
          },
          subject: `Order Confirmation - ${order.orderNumber}`,
          templateType: 'order-confirmation',
          providerMessageId: emailResult.messageId,
          status: 'sent',
          metadata: {
            orderId: order._id,
            tags: ['order-confirmation']
          }
        }).save();
        console.log(`✅ Email log saved to database for order ${order.orderNumber}`);
      } else {
        console.error(`❌ Email service reported failure for order ${order.orderNumber}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error(`❌ Failed to send order confirmation email for order ${order.orderNumber}:`, {
        error: emailError.message,
        stack: emailError.stack,
        customerEmail: order.userId.email
      });
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.menuItemId', 'name imageUrl'),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        orders,
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    // Check if the id is a valid ObjectId (24 character hex string)
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      // Search by ObjectId
      order = await Order.findOne({
        _id: id,
        userId: req.user._id
      }).populate('items.menuItemId', 'name imageUrl category');
    } else {
      // Search by order number
      order = await Order.findOne({
        orderNumber: id,
        userId: req.user._id
      }).populate('items.menuItemId', 'name imageUrl category');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number
// @access  Private
router.get('/track/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      userId: req.user._id
    }).populate('items.menuItemId', 'name imageUrl');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate progress percentage based on status
    const statusProgress = {
      'Placed': 25,
      'Preparing': 50,
      'Out for Delivery': 75,
      'Delivered': 100,
      'Cancelled': 0
    };

    res.json({
      success: true,
      data: {
        order,
        progress: statusProgress[order.status] || 0,
        isDelivered: order.status === 'Delivered',
        isCancelled: order.status === 'Cancelled'
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking order'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (only if status is 'Placed')
// @access  Private
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'Placed') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled as it is already being prepared'
      });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// Admin routes

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/admin/all', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name email phone')
        .populate('items.menuItemId', 'name imageUrl'),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        orders,
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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/admin/:id/status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

module.exports = router;
