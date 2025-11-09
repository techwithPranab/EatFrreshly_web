#!/usr/bin/env node

/**
 * Test script to verify order confirmation email functionality
 * Run with: node test-order-email.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Load all models first
require('./models/User');
require('./models/Order');
require('./models/EmailLog');
require('./models/MenuItem');
require('./models/Cart');

const emailService = require('./services/emailService');

async function testOrderEmail() {
  try {
    console.log('🔍 Testing order confirmation email functionality...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant');
    console.log('✅ Connected to database\n');

    // Create a test order
    const Order = mongoose.model('Order');
    const testOrder = new Order({
      userId: '507f1f77bcf86cd799439011', // Dummy user ID
      items: [{
        menuItemId: '507f1f77bcf86cd799439012', // Dummy menu item ID
        name: 'Test Burger',
        price: 15.99,
        quantity: 2
      }],
      totalPrice: 31.98,
      deliveryAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India'
      },
      paymentMethod: 'Cash on Delivery'
    });

    const savedOrder = await testOrder.save();
    console.log(`✅ Created test order: ${savedOrder.orderNumber}\n`);

    // Test email sending
    console.log('📧 Testing email service...\n');

    const orderData = {
      orderNumber: savedOrder.orderNumber,
      createdAt: savedOrder.createdAt,
      items: savedOrder.items,
      subtotal: 31.98,
      totalPrice: 31.98,
      deliveryAddress: '123 Test Street, Test City, Test State 12345',
      estimatedDeliveryTime: null
    };

    const customerData = {
      name: 'Test Customer',
      email: 'destinationkolkata01@gmail.com' || 'test@example.com' // Use sender email for testing
    };

    const emailResult = await emailService.sendOrderConfirmation(orderData, customerData);

    console.log('\n📊 Email Test Results:');
    console.log('====================');
    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log(`📧 Message ID: ${emailResult.messageId}`);
    } else {
      console.log('❌ Email failed to send!');
      console.log(`🔍 Error: ${emailResult.error}`);
    }

    // Check email logs
    console.log('\n📋 Checking email logs...');
    const EmailLog = mongoose.model('EmailLog');
    const recentLogs = await EmailLog.find({
      templateType: 'order-confirmation',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`Found ${recentLogs.length} recent order confirmation email logs:`);
    recentLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log.subject} - Status: ${log.status} - To: ${log.recipient.email}`);
    });

    // Clean up test order
    await Order.findByIdAndDelete(savedOrder._id);
    console.log('\n🧹 Cleaned up test order');

    await mongoose.disconnect();
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testOrderEmail();
