const Order = require('../models/Order');
const KitchenTask = require('../models/KitchenTask');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

class ChefService {
  // Create kitchen task from order
  static async createKitchenTaskFromOrder(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('userId', 'name')
        .populate('items.menuItemId', 'preparationTime');

      if (!order) {
        throw new Error('Order not found');
      }

      // Transform order items for kitchen task
      const kitchenItems = order.items.map(item => ({
        menuItemId: item.menuItemId._id,
        name: item.name,
        quantity: item.quantity,
        preparationTime: item.menuItemId.preparationTime || 15, // default 15 minutes
        specialInstructions: order.specialInstructions || ''
      }));

      const kitchenTask = new KitchenTask({
        orderId: order._id,
        orderNumber: order.orderNumber,
        items: kitchenItems,
        customerName: order.userId.name,
        priority: this.calculatePriority(order),
        tableNumber: order.tableNumber || null
      });

      await kitchenTask.save();

      // Update order with kitchen task reference
      order.kitchenTaskId = kitchenTask._id;
      order.status = 'confirmed';
      await order.save();

      return kitchenTask;
    } catch (error) {
      throw new Error(`Failed to create kitchen task: ${error.message}`);
    }
  }

  // Calculate order priority based on various factors
  static calculatePriority(order) {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const minutesSinceOrder = (now - orderTime) / (1000 * 60);

    // High priority if order is older than 30 minutes
    if (minutesSinceOrder > 30) return 'high';
    
    // Urgent if older than 60 minutes
    if (minutesSinceOrder > 60) return 'urgent';
    
    // Normal priority otherwise
    return 'normal';
  }

  // Get available chefs for assignment
  static async getAvailableChefs() {
    try {
      const chefs = await User.find({
        role: { $in: ['chef', 'chef_manager'] },
        isActive: true
      }).select('name email role');

      // Get current workload for each chef
      const chefsWithWorkload = await Promise.all(
        chefs.map(async (chef) => {
          const activeTasks = await KitchenTask.countDocuments({
            assignedChef: chef._id,
            status: { $in: ['assigned', 'in_progress'] }
          });

          return {
            ...chef.toObject(),
            activeTasks
          };
        })
      );

      // Sort by workload (ascending)
      return chefsWithWorkload.sort((a, b) => a.activeTasks - b.activeTasks);
    } catch (error) {
      throw new Error(`Failed to get available chefs: ${error.message}`);
    }
  }

  // Auto-assign task to chef with least workload
  static async autoAssignTask(taskId) {
    try {
      const availableChefs = await this.getAvailableChefs();
      
      if (availableChefs.length === 0) {
        throw new Error('No available chefs found');
      }

      // Assign to chef with least active tasks
      const selectedChef = availableChefs[0];
      
      const task = await KitchenTask.findByIdAndUpdate(
        taskId,
        {
          assignedChef: selectedChef._id,
          status: 'assigned'
        },
        { new: true }
      );

      return task;
    } catch (error) {
      throw new Error(`Failed to auto-assign task: ${error.message}`);
    }
  }

  // Calculate kitchen performance metrics
  static async getKitchenMetrics(startDate, endDate, additionalFilter = {}) {
    try {
      const dateFilter = { ...additionalFilter };
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const [
        totalTasks,
        completedTasks,
        avgPreparationTime,
        tasksByStatus,
        delayedTasks
      ] = await Promise.all([
        KitchenTask.countDocuments(dateFilter),
        KitchenTask.countDocuments({ ...dateFilter, status: 'completed' }),
        KitchenTask.aggregate([
          { $match: { ...dateFilter, status: 'completed', totalPreparationTime: { $gt: 0 } } },
          { $group: { _id: null, avgTime: { $avg: '$totalPreparationTime' } } }
        ]),
        KitchenTask.aggregate([
          { $match: dateFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        KitchenTask.countDocuments({
          ...dateFilter,
          status: 'completed',
          $expr: { $gt: ['$totalPreparationTime', { $sum: { $map: { input: '$items', as: 'item', in: { $multiply: ['$$item.preparationTime', '$$item.quantity'] } } } }] }
        })
      ]);

      return {
        overview: {
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
          avgPreparationTime: avgPreparationTime[0]?.avgTime || 0,
          delayedTasks
        },
        statusBreakdown: tasksByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw new Error(`Failed to calculate kitchen metrics: ${error.message}`);
    }
  }

  // Get chef performance metrics
  static async getChefPerformance(chefId, startDate, endDate) {
    try {
      const dateFilter = { assignedChef: chefId };
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const [
        completedTasks,
        avgTime,
        totalTasks
      ] = await Promise.all([
        KitchenTask.countDocuments({ ...dateFilter, status: 'completed' }),
        KitchenTask.aggregate([
          { $match: { ...dateFilter, status: 'completed', totalPreparationTime: { $gt: 0 } } },
          { $group: { _id: null, avgTime: { $avg: '$totalPreparationTime' } } }
        ]),
        KitchenTask.countDocuments(dateFilter)
      ]);

      return {
        completedTasks,
        totalTasks,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
        avgPreparationTime: avgTime[0]?.avgTime || 0
      };
    } catch (error) {
      throw new Error(`Failed to get chef performance: ${error.message}`);
    }
  }
}

module.exports = ChefService;
