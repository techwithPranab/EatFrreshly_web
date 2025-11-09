const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

// Only initialize Stripe if the secret key is provided
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  Stripe not initialized: Please add your STRIPE_SECRET_KEY to .env file');
}

const router = express.Router();

// Validation middleware for payment intent creation
const validatePaymentIntent = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['usd', 'inr'])
    .withMessage('Currency must be USD or INR')
];

// @route   POST /api/stripe/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', authenticateToken, validatePaymentIntent, async (req, res) => {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment processing is currently unavailable. Please contact support.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, currency = 'inr', orderData } = req.body;

    // Get user's cart to validate items
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.menuItemId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate all items are still available
    for (const item of cart.items) {
      if (!item.menuItemId || !item.menuItemId.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Item "${item.menuItemId?.name || 'Unknown'}" is no longer available`
        });
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/paise
      currency: currency.toLowerCase(),
      metadata: {
        userId: req.user._id.toString(),
        orderData: JSON.stringify(orderData)
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// @route   POST /api/stripe/confirm-payment
// @desc    Confirm payment and create order
// @access  Private
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment processing is currently unavailable. Please contact support.'
      });
    }

    const { paymentIntentId, orderData } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment was not successful'
      });
    }

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

    // Create order with payment details
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      totalPrice,
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: 'Stripe',
      paymentStatus: 'paid',
      paymentIntentId: paymentIntentId,
      specialInstructions: orderData.deliveryNotes,
      estimatedDeliveryTime
    });

    await order.save();

    // Clear user's cart
    await Cart.findOneAndDelete({ userId: req.user._id });

    // Populate order with user details for email
    await order.populate('userId', 'name email phone');

    // Send order confirmation email (you can implement this)
    // await emailService.sendOrderConfirmation(order, order.userId);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment and create order'
    });
  }
});

// @route   POST /api/stripe/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified with Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Check if Stripe is initialized
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Webhook processing is currently unavailable.'
    });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);

      // Update order status if needed
      try {
        await Order.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { paymentStatus: 'paid' }
        );
      } catch (error) {
        console.error('Error updating order payment status:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('PaymentIntent failed:', failedPaymentIntent.id);

      // Update order status
      try {
        await Order.findOneAndUpdate(
          { paymentIntentId: failedPaymentIntent.id },
          { paymentStatus: 'failed' }
        );
      } catch (error) {
        console.error('Error updating order payment status:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
