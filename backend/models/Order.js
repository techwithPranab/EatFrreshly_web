const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true }
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Stripe'],
    default: 'Cash on Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  estimatedDeliveryTime: {
    type: Date
  },
  specialInstructions: {
    type: String,
    maxLength: [500, 'Special instructions cannot exceed 500 characters']
  },
  orderNumber: {
    type: String,
    unique: true
  },
  kitchenTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KitchenTask',
    default: null
  },
  assignedChef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'EF' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

// Create kitchen tasks after order is saved
orderSchema.post('save', async function(doc) {
  if (doc.isNew && doc.status === 'pending') {
    try {
      const KitchenTask = mongoose.model('KitchenTask');
      
      // Create kitchen tasks for each menu item in the order
      const kitchenTasks = [];
      for (const item of doc.items) {
        const kitchenTask = new KitchenTask({
          orderId: doc._id,
          menuItem: item.menuItemId,
          quantity: item.quantity,
          status: 'pending',
          estimatedTime: 30, // Default 30 minutes
          priority: 'medium'
        });
        
        const savedTask = await kitchenTask.save();
        kitchenTasks.push(savedTask._id);
      }
      
      // Update the order with kitchen task references
      if (kitchenTasks.length > 0) {
        // For simplicity, use the first kitchen task as the main reference
        // In a more complex system, you might want to handle multiple tasks differently
        await mongoose.model('Order').findByIdAndUpdate(doc._id, {
          kitchenTaskId: kitchenTasks[0],
          status: 'confirmed'
        });
        
        console.log(`Created ${kitchenTasks.length} kitchen tasks for order ${doc.orderNumber}`);
      }
    } catch (error) {
      console.error('Error creating kitchen tasks for order:', error);
    }
  }
});

// Index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
