const Order = require('../../models/Order');
const KitchenTask = require('../../models/KitchenTask');
const EmailLog = require('../../models/EmailLog');
const ChefService = require('../../services/chefService');
const emailService = require('../../services/emailService');

const chefOrderController = {
  // Get pending orders based on chef role
  async getPendingOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const priority = req.query.priority || '';

      let filter = {
        status: { $in: ['pending', 'confirmed'] }
      };

      // If user is a chef (not manager), only show unassigned orders
      if (req.user.role === 'chef') {
        filter.assignedChef = { $exists: false };
      }

      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'userId.name': { $regex: search, $options: 'i' } }
        ];
      }

      const total = await Order.countDocuments(filter);
      const orders = await Order.find(filter)
        .populate('userId', 'name email phone')
        .populate('items.menuItemId', 'name preparationTime')
        .populate('assignedChef', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending orders'
      });
    }
  },

  // Accept an order (create kitchen task)
  async acceptOrder(req, res) {
    try {
      const { id } = req.params;
      const { assignToChef } = req.body; // Optional: chef manager can assign to specific chef

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status !== 'pending' && order.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be accepted in current status'
        });
      }

      // Create kitchen task
      const kitchenTask = await ChefService.createKitchenTaskFromOrder(id);

      // Assign chef if specified (chef manager only) or auto-assign
      if (req.user.role === 'chef_manager' && assignToChef) {
        kitchenTask.assignedChef = assignToChef;
        kitchenTask.status = 'assigned';
        await kitchenTask.save();
      } else if (req.user.role === 'chef') {
        // Regular chef accepting unassigned order
        kitchenTask.assignedChef = req.user._id;
        kitchenTask.status = 'assigned';
        await kitchenTask.save();
      } else {
        // Auto-assign to available chef
        await ChefService.autoAssignTask(kitchenTask._id);
      }

      // Update order status
      order.status = 'preparing';
      order.assignedChef = kitchenTask.assignedChef;
      await order.save();

      const updatedTask = await KitchenTask.findById(kitchenTask._id)
        .populate('assignedChef', 'name')
        .populate('orderId');

      res.json({
        success: true,
        message: 'Order accepted successfully',
        data: updatedTask
      });
    } catch (error) {
      console.error('Error accepting order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to accept order'
      });
    }
  },

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['in_progress', 'ready', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const kitchenTask = await KitchenTask.findOne({ orderId: id });
      if (!kitchenTask) {
        return res.status(404).json({
          success: false,
          message: 'Kitchen task not found'
        });
      }

      // Check permission: chefs can only update their assigned tasks
      if (req.user.role === 'chef' && 
          kitchenTask.assignedChef.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your assigned tasks'
        });
      }

      // Update kitchen task
      const updateData = { status };
      if (notes) updateData.notes = notes;

      if (status === 'in_progress' && !kitchenTask.actualStartTime) {
        updateData.actualStartTime = new Date();
      }

      if (status === 'completed' && !kitchenTask.actualCompletionTime) {
        updateData.actualCompletionTime = new Date();
      }

      const updatedTask = await KitchenTask.findByIdAndUpdate(
        kitchenTask._id,
        updateData,
        { new: true }
      );

      // Update order status accordingly
      const orderStatusMap = {
        'in_progress': 'preparing',
        'ready': 'ready',
        'completed': 'ready'
      };

      const updatedOrder = await Order.findByIdAndUpdate(id, {
        status: orderStatusMap[status]
      }, { new: true }).populate('userId', 'name email phone');

      // Send completion email when order is completed
      if (status === 'completed' && updatedOrder) {
        try {
          const emailResult = await emailService.sendOrderCompletion(
            {
              orderNumber: updatedOrder.orderNumber,
              items: updatedOrder.items,
              totalPrice: updatedOrder.totalPrice,
              deliveryAddress: updatedOrder.deliveryAddress ? 
                `${updatedOrder.deliveryAddress.street}, ${updatedOrder.deliveryAddress.city}, ${updatedOrder.deliveryAddress.state} ${updatedOrder.deliveryAddress.zipCode}` : null,
              orderType: updatedOrder.deliveryAddress ? 'delivery' : 'pickup'
            },
            {
              name: updatedOrder.userId.name,
              email: updatedOrder.userId.email
            }
          );

          // Log email sending
          if (emailResult.success) {
            await new EmailLog({
              recipient: {
                email: updatedOrder.userId.email,
                name: updatedOrder.userId.name
              },
              sender: {
                email: process.env.EMAIL_SENDER_EMAIL || 'noreply@healthyrestaurant.com',
                name: process.env.EMAIL_SENDER_NAME || 'Healthy Restaurant'
              },
              subject: `Your Order is Ready! - ${updatedOrder.orderNumber}`,
              templateType: 'order-completion',
              providerMessageId: emailResult.messageId,
              status: 'sent',
              metadata: {
                orderId: updatedOrder._id,
                tags: ['order-completion']
              }
            }).save();
          }
        } catch (emailError) {
          console.error('Failed to send order completion email:', emailError);
          // Don't fail the order update if email fails
        }
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedTask
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  },

  // Get assigned orders for a chef
  async getAssignedOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || '';

      let filter = {};

      // If regular chef, only show their assigned tasks
      if (req.user.role === 'chef') {
        filter.assignedChef = req.user._id;
      }

      if (status) {
        filter.status = status;
      } else {
        // Show active tasks by default
        filter.status = { $in: ['assigned', 'in_progress'] };
      }

      const total = await KitchenTask.countDocuments(filter);
      const tasks = await KitchenTask.find(filter)
        .populate('assignedChef', 'name')
        .populate('orderId', 'orderNumber totalPrice')
        .sort({ priority: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        success: true,
        data: {
          tasks,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assigned orders'
      });
    }
  },

  // Get dashboard data
  async getDashboardData(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;

      // Get base stats
      let filter = {};
      if (userRole === 'chef') {
        // Regular chef sees only their tasks
        filter.assignedChef = userId;
      }

      // Dashboard stats
      const [
        totalOrders,
        pendingOrders,
        assignedOrders,
        totalKitchenTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        recentTasks
      ] = await Promise.all([
        Order.countDocuments({}),
        Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
        Order.countDocuments({ assignedChef: userId }),
        KitchenTask.countDocuments(filter),
        KitchenTask.countDocuments({ ...filter, status: 'pending' }),
        KitchenTask.countDocuments({ ...filter, status: 'in_progress' }),
        KitchenTask.countDocuments({ 
          ...filter, 
          status: 'completed',
          updatedAt: { $gte: new Date(Date.now() - 24*60*60*1000) } // Last 24 hours
        }),
        KitchenTask.find({ ...filter, status: { $in: ['assigned', 'in_progress'] } })
          .populate('assignedChef', 'name')
          .populate('orderId', 'orderNumber totalPrice')
          .sort({ priority: 1, createdAt: 1 })
          .limit(5)
      ]);

      // Calculate completion rate
      const totalCompleted = await KitchenTask.countDocuments({ 
        ...filter, 
        status: 'completed',
        updatedAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } // Last 7 days
      });
      const totalTasksWeek = await KitchenTask.countDocuments({ 
        ...filter,
        createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
      });
      const completionRate = totalTasksWeek > 0 ? Math.round((totalCompleted / totalTasksWeek) * 100) : 0;

      // Priority breakdown for chef managers
      let priorityBreakdown = null;
      if (userRole === 'chef_manager') {
        priorityBreakdown = {
          urgent: await KitchenTask.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] }, priority: 'urgent' }),
          high: await KitchenTask.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] }, priority: 'high' }),
          normal: await KitchenTask.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] }, priority: 'normal' }),
          low: await KitchenTask.countDocuments({ status: { $in: ['pending', 'assigned', 'in_progress'] }, priority: 'low' })
        };
      }

      res.json({
        success: true,
        data: {
          overview: {
            totalOrders,
            totalTasks: totalKitchenTasks,
            completedTasks,
            completionRate
          },
          statusBreakdown: {
            pending: pendingTasks,
            in_progress: inProgressTasks,
            completed: completedTasks
          },
          activePriorityBreakdown: priorityBreakdown,
          recentTasks: recentTasks.map(task => ({
            _id: task._id,
            orderNumber: task.orderId?.orderNumber || 'N/A',
            status: task.status,
            priority: task.priority,
            assignedChef: task.assignedChef,
            customerName: 'Customer', // Add customer name if available
            items: task.items || [],
            createdAt: task.createdAt
          })),
          userStats: {
            pendingOrders,
            assignedOrders,
            myTasks: userRole === 'chef' ? totalKitchenTasks : null
          }
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch dashboard data',
        error: error.message 
      });
    }
  }
};

module.exports = chefOrderController;
