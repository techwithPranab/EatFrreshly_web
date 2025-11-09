const mongoose = require('mongoose');
const Order = require('../models/Order');
const KitchenTask = require('../models/KitchenTask');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

async function seedSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if sample data already exists
    const existingOrders = await Order.countDocuments();
    if (existingOrders > 5) {
      console.log('Sample orders already exist. Skipping seed...');
      return;
    }

    // Get sample users and menu items
    const customers = await User.find({ role: 'customer' }).limit(3);
    const chefs = await User.find({ role: 'chef' }).limit(3);
    const menuItems = await MenuItem.find({}).limit(5);

    if (customers.length === 0 || menuItems.length === 0) {
      console.log('Please ensure customers and menu items exist before seeding orders');
      return;
    }

    // Create sample orders
    const sampleOrders = [
      {
        userId: customers[0]._id,
        items: [
          {
            menuItemId: menuItems[0]._id,
            name: menuItems[0].name,
            price: menuItems[0].price,
            quantity: 2
          },
          {
            menuItemId: menuItems[1]._id,
            name: menuItems[1].name,
            price: menuItems[1].price,
            quantity: 1
          }
        ],
        totalPrice: (menuItems[0].price * 2) + menuItems[1].price,
        status: 'pending',
        deliveryAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        paymentMethod: 'Credit Card',
        specialInstructions: 'Extra spicy please'
      },
      {
        userId: customers[1]._id,
        items: [
          {
            menuItemId: menuItems[2]._id,
            name: menuItems[2].name,
            price: menuItems[2].price,
            quantity: 1
          }
        ],
        totalPrice: menuItems[2].price,
        status: 'confirmed',
        deliveryAddress: {
          street: '456 Oak Ave',
          city: 'Somewhere',
          state: 'NY',
          zipCode: '67890',
          country: 'USA'
        },
        paymentMethod: 'Digital Wallet'
      },
      {
        userId: customers[2] || customers[0],
        items: [
          {
            menuItemId: menuItems[3]._id,
            name: menuItems[3].name,
            price: menuItems[3].price,
            quantity: 3
          }
        ],
        totalPrice: menuItems[3].price * 3,
        status: 'preparing',
        deliveryAddress: {
          street: '789 Pine Rd',
          city: 'Nowhere',
          state: 'TX',
          zipCode: '54321',
          country: 'USA'
        },
        paymentMethod: 'Cash on Delivery',
        specialInstructions: 'No onions'
      }
    ];

    // Create orders
    const createdOrders = [];
    for (const orderData of sampleOrders) {
      const order = new Order(orderData);
      await order.save();
      createdOrders.push(order);
      console.log(`✅ Created order: ${order.orderNumber}`);
    }

    // Create kitchen tasks for confirmed/preparing orders
    for (const order of createdOrders) {
      if (['confirmed', 'preparing'].includes(order.status)) {
        const customer = await User.findById(order.userId);
        
        const kitchenItems = order.items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          preparationTime: 15, // Default 15 minutes
          specialInstructions: order.specialInstructions || ''
        }));

        const kitchenTask = new KitchenTask({
          orderId: order._id,
          orderNumber: order.orderNumber,
          items: kitchenItems,
          customerName: customer.name,
          priority: 'normal',
          status: order.status === 'preparing' ? 'assigned' : 'pending',
          assignedChef: order.status === 'preparing' && chefs.length > 0 ? chefs[0]._id : null
        });

        // If task is assigned, set start time
        if (kitchenTask.status === 'assigned') {
          kitchenTask.actualStartTime = new Date();
        }

        await kitchenTask.save();
        
        // Update order with kitchen task reference
        order.kitchenTaskId = kitchenTask._id;
        if (kitchenTask.assignedChef) {
          order.assignedChef = kitchenTask.assignedChef;
        }
        await order.save();

        console.log(`✅ Created kitchen task for order: ${order.orderNumber}`);
      }
    }

    console.log('\n🎉 Sample orders and kitchen tasks seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedSampleData();
}

module.exports = seedSampleData;
