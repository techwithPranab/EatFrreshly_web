const mongoose = require('mongoose');

const kitchenTaskSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  orderNumber: {
    type: String,
    required: true
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
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    preparationTime: {
      type: Number,  // in minutes
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'ready', 'served'],
      default: 'pending'
    },
    specialInstructions: {
      type: String,
      maxLength: 500
    }
  }],
  assignedChef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedCompletionTime: {
    type: Date
  },
  actualStartTime: {
    type: Date
  },
  actualCompletionTime: {
    type: Date
  },
  totalPreparationTime: {
    type: Number, // in minutes - calculated from start to completion
    default: 0
  },
  notes: {
    type: String,
    maxLength: 1000
  },
  customerName: {
    type: String,
    required: true
  },
  tableNumber: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Calculate estimated completion time based on preparation times
kitchenTaskSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    const totalPrepTime = this.items.reduce((total, item) => {
      return total + (item.preparationTime * item.quantity);
    }, 0);
    
    if (this.actualStartTime) {
      this.estimatedCompletionTime = new Date(this.actualStartTime.getTime() + (totalPrepTime * 60000));
    }
  }
  
  // Calculate actual preparation time when completed
  if (this.status === 'completed' && this.actualStartTime && this.actualCompletionTime) {
    this.totalPreparationTime = Math.round((this.actualCompletionTime - this.actualStartTime) / 60000);
  }
  
  next();
});

// Indexes for better query performance
kitchenTaskSchema.index({ status: 1, createdAt: -1 });
kitchenTaskSchema.index({ assignedChef: 1, status: 1 });
kitchenTaskSchema.index({ orderId: 1 });
kitchenTaskSchema.index({ priority: 1, createdAt: 1 });

// Middleware to update order status when kitchen task status changes
kitchenTaskSchema.post('save', async function(doc) {
  try {
    const Order = mongoose.model('Order');
    
    // Get all kitchen tasks for this order
    const allTasks = await mongoose.model('KitchenTask').find({ orderId: doc.orderId });
    
    // Check if all tasks are completed
    const allCompleted = allTasks.every(task => task.status === 'completed');
    const anyInProgress = allTasks.some(task => task.status === 'in-progress');
    
    let newOrderStatus;
    if (allCompleted) {
      newOrderStatus = 'ready';
    } else if (anyInProgress) {
      newOrderStatus = 'preparing';
    } else {
      newOrderStatus = 'confirmed';
    }
    
    // Update the order status
    await Order.findByIdAndUpdate(doc.orderId, { status: newOrderStatus });
    console.log(`Order ${doc.orderId} status updated to: ${newOrderStatus} via middleware`);
  } catch (error) {
    console.error('Error updating order status via middleware:', error);
  }
});

// Middleware to update order status when kitchen task status changes via findOneAndUpdate
kitchenTaskSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    try {
      const Order = mongoose.model('Order');
      
      // Get all kitchen tasks for this order
      const allTasks = await mongoose.model('KitchenTask').find({ orderId: doc.orderId });
      
      // Check if all tasks are completed
      const allCompleted = allTasks.every(task => task.status === 'completed');
      const anyInProgress = allTasks.some(task => task.status === 'in-progress');
      
      let newOrderStatus;
      if (allCompleted) {
        newOrderStatus = 'ready';
      } else if (anyInProgress) {
        newOrderStatus = 'preparing';
      } else {
        newOrderStatus = 'confirmed';
      }
      
      // Update the order status
      await Order.findByIdAndUpdate(doc.orderId, { status: newOrderStatus });
      console.log(`Order ${doc.orderId} status updated to: ${newOrderStatus} via findOneAndUpdate middleware`);
    } catch (error) {
      console.error('Error updating order status via findOneAndUpdate middleware:', error);
    }
  }
});

module.exports = mongoose.model('KitchenTask', kitchenTaskSchema);
