const KitchenTask = require('../../models/KitchenTask');
const Order = require('../../models/Order');
const User = require('../../models/User');
const ChefService = require('../../services/chefService');

const chefKitchenController = {
  // Get all kitchen tasks based on role
  async getKitchenTasks(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || '';
      const priority = req.query.priority || '';
      const assignedChef = req.query.assignedChef || '';

      let filter = {};

      // If regular chef, only show their tasks
      if (req.user.role === 'chef') {
        filter.assignedChef = req.user._id;
      }

      if (status) {
        filter.status = status;
      }

      if (priority) {
        filter.priority = priority;
      }

      if (assignedChef && req.user.role === 'chef_manager') {
        filter.assignedChef = assignedChef;
      }

      const total = await KitchenTask.countDocuments(filter);
      const tasks = await KitchenTask.find(filter)
        .populate('assignedChef', 'name')
        .populate('orderId', 'orderNumber totalPrice deliveryAddress')
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
      console.error('Error fetching kitchen tasks:', error);
      console.log('Error details:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch kitchen tasks'
      });
    }
  },

  // Get single kitchen task
  async getKitchenTask(req, res) {
    try {
      const { id } = req.params;
      console.log(`Fetching kitchen task with ID: ${id}`);

      const task = await KitchenTask.findById(id)
        .populate('assignedChef', 'name email')
        .populate('orderId');

      console.log(`Found task:`, task);

      if (!task) {
        console.log(`Kitchen task not found for ID: ${id}`);
        return res.status(404).json({
          success: false,
          message: 'Kitchen task not found'
        });
      }

      // Check permission for regular chefs
      if (req.user.role === 'chef' && 
          task.assignedChef && 
          task.assignedChef._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Error fetching kitchen task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch kitchen task'
      });
    }
  },

  // Update kitchen task status specifically
  async updateKitchenTaskStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const task = await KitchenTask.findById(id).populate('orderId');
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Kitchen task not found'
        });
      }

      // Check permissions for regular chefs
      if (req.user.role === 'chef' && 
          task.assignedChef && 
          task.assignedChef.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Update the task
      const updateData = { status };
      if (notes) updateData.notes = notes;

      if (status === 'in_progress' && !task.actualStartTime) {
        updateData.actualStartTime = new Date();
      }

      if (status === 'completed' && !task.actualCompletionTime) {
        updateData.actualCompletionTime = new Date();
      }

      const updatedTask = await KitchenTask.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('orderId').populate('assignedChef', 'name');

      // Update order status based on all kitchen tasks for this order
      if (updatedTask.orderId) {
        await updateOrderStatusBasedOnTasks(updatedTask.orderId._id);
      }

      res.json({
        success: true,
        message: 'Kitchen task status updated successfully',
        data: updatedTask
      });
    } catch (error) {
      console.error('Error updating kitchen task status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update kitchen task status'
      });
    }
  },

  // Update kitchen task (chef manager only for assignment changes)
  async updateKitchenTask(req, res) {
    try {
      const { id } = req.params;
      const { assignedChef, priority, notes, status } = req.body;

      const task = await KitchenTask.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Kitchen task not found'
        });
      }

      // Check permissions
      if (req.user.role === 'chef') {
        // Regular chefs can only update their own tasks and limited fields
        if (task.assignedChef.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
        
        // Chefs can only update status and notes
        const allowedUpdates = {};
        if (status) allowedUpdates.status = status;
        if (notes) allowedUpdates.notes = notes;
        
        if (status === 'in_progress' && !task.actualStartTime) {
          allowedUpdates.actualStartTime = new Date();
        }
        
        if (status === 'completed' && !task.actualCompletionTime) {
          allowedUpdates.actualCompletionTime = new Date();
        }

        const updatedTask = await KitchenTask.findByIdAndUpdate(
          id,
          allowedUpdates,
          { new: true }
        ).populate('orderId');

        // Update order status if task status was changed
        if (status && updatedTask.orderId) {
          await updateOrderStatusBasedOnTasks(updatedTask.orderId._id);
        }

        return res.json({
          success: true,
          message: 'Kitchen task updated successfully',
          data: updatedTask
        });
      }

      // Chef manager can update all fields
      const updateData = {};
      if (assignedChef !== undefined) updateData.assignedChef = assignedChef;
      if (priority) updateData.priority = priority;
      if (notes) updateData.notes = notes;
      if (status) updateData.status = status;

      if (status === 'in_progress' && !task.actualStartTime) {
        updateData.actualStartTime = new Date();
      }

      if (status === 'completed' && !task.actualCompletionTime) {
        updateData.actualCompletionTime = new Date();
      }

      const updatedTask = await KitchenTask.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('assignedChef', 'name').populate('orderId');

      // Update order status if task status was changed
      if (status && updatedTask.orderId) {
        await updateOrderStatusBasedOnTasks(updatedTask.orderId._id);
      }

      res.json({
        success: true,
        message: 'Kitchen task updated successfully',
        data: updatedTask
      });
    } catch (error) {
      console.error('Error updating kitchen task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update kitchen task'
      });
    }
  },

  // Delete/Cancel kitchen task (chef manager only)
  async deleteKitchenTask(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Only chef managers can delete kitchen tasks'
        });
      }

      const { id } = req.params;

      const task = await KitchenTask.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Kitchen task not found'
        });
      }

      // Mark task as cancelled instead of deleting
      task.status = 'cancelled';
      await task.save();

      res.json({
        success: true,
        message: 'Kitchen task cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling kitchen task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel kitchen task'
      });
    }
  },

  // Get kitchen statistics
  async getKitchenStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      // Filter tasks based on user role
      let taskFilter = {};
      if (req.user.role === 'chef') {
        // Regular chefs can only see stats for their assigned tasks
        taskFilter.assignedChef = req.user._id;
      }
      // Chef managers can see all tasks (no additional filter)
      
      const stats = await ChefService.getKitchenMetrics(startDate, endDate, taskFilter);

      // Get active tasks by priority (also filtered by user role)
      const activeTasksQuery = [
        {
          $match: {
            status: { $in: ['pending', 'assigned', 'in_progress'] },
            ...taskFilter
          }
        },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ];

      const activeTasks = await KitchenTask.aggregate(activeTasksQuery);

      // Get chef workload (chef manager only)
      let chefWorkload = [];
      if (req.user.role === 'chef_manager') {
        chefWorkload = await User.aggregate([
          {
            $match: {
              role: { $in: ['chef', 'chef_manager'] },
              isActive: true
            }
          },
          {
            $lookup: {
              from: 'kitchentasks',
              localField: '_id',
              foreignField: 'assignedChef',
              pipeline: [
                {
                  $match: {
                    status: { $in: ['assigned', 'in_progress'] }
                  }
                }
              ],
              as: 'activeTasks'
            }
          },
          {
            $project: {
              name: 1,
              role: 1,
              activeTasks: { $size: '$activeTasks' }
            }
          }
        ]);
      }

      res.json({
        success: true,
        data: {
          ...stats,
          activePriorityBreakdown: activeTasks.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          chefWorkload
        }
      });
    } catch (error) {
      console.error('Error fetching kitchen stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch kitchen statistics'
      });
    }
  },

  // Assign task to chef (chef manager only)
  async assignTaskToChef(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Only chef managers can assign tasks'
        });
      }

      const { taskId, chefId } = req.body;

      const [task, chef] = await Promise.all([
        KitchenTask.findById(taskId),
        User.findById(chefId)
      ]);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Kitchen task not found'
        });
      }

      if (!chef || !['chef', 'chef_manager'].includes(chef.role)) {
        return res.status(404).json({
          success: false,
          message: 'Chef not found or invalid role'
        });
      }

      task.assignedChef = chefId;
      task.status = 'assigned';
      await task.save();

      const updatedTask = await KitchenTask.findById(taskId)
        .populate('assignedChef', 'name');

      res.json({
        success: true,
        message: 'Task assigned successfully',
        data: updatedTask
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign task'
      });
    }
  }
};

// Helper function to update order status based on kitchen tasks
async function updateOrderStatusBasedOnTasks(orderId) {
  try {
    const allTasks = await KitchenTask.find({ orderId });
    
    // Check task statuses
    const allCompleted = allTasks.every(task => task.status === 'completed');
    const anyInProgress = allTasks.some(task => task.status === 'in_progress');
    
    let newOrderStatus;
    if (allCompleted) {
      newOrderStatus = 'ready';
    } else if (anyInProgress) {
      newOrderStatus = 'preparing';
    } else {
      newOrderStatus = 'confirmed';
    }
    
    // Update the order status
    await Order.findByIdAndUpdate(orderId, { status: newOrderStatus });
    console.log(`Order ${orderId} status updated to: ${newOrderStatus}`);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}

module.exports = chefKitchenController;
