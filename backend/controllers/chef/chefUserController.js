const User = require('../../models/User');
const { validationResult } = require('express-validator');

const chefUserController = {
  // Get all chef users (chef manager only)
  async getChefUsers(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const role = req.query.role || '';
      const status = req.query.status || '';

      const filter = {
        role: { $in: ['chef', 'chef_manager'] }
      };

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (role && ['chef', 'chef_manager'].includes(role)) {
        filter.role = role;
      }

      if (status) {
        filter.isActive = status === 'active';
      }

      const total = await User.countDocuments(filter);
      const users = await User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      // Get current workload for each chef
      const usersWithWorkload = await Promise.all(
        users.map(async (user) => {
          const KitchenTask = require('../../models/KitchenTask');
          const activeTasks = await KitchenTask.countDocuments({
            assignedChef: user._id,
            status: { $in: ['assigned', 'in_progress'] }
          });

          return {
            ...user.toObject(),
            activeTasks
          };
        })
      );

      res.json({
        success: true,
        data: {
          users: usersWithWorkload,
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
      console.error('Error fetching chef users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chef users'
      });
    }
  },

  // Get single chef user
  async getChefUser(req, res) {
    try {
      const { id } = req.params;

      // Check permission: chefs can view their own profile, managers can view all
      if (req.user.role === 'chef' && id !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const user = await User.findById(id).select('-passwordHash');

      if (!user || !['chef', 'chef_manager'].includes(user.role)) {
        return res.status(404).json({
          success: false,
          message: 'Chef user not found'
        });
      }

      // Get performance metrics
      const KitchenTask = require('../../models/KitchenTask');
      const [activeTasks, completedTasks, totalTasks] = await Promise.all([
        KitchenTask.countDocuments({
          assignedChef: id,
          status: { $in: ['assigned', 'in_progress'] }
        }),
        KitchenTask.countDocuments({
          assignedChef: id,
          status: 'completed'
        }),
        KitchenTask.countDocuments({
          assignedChef: id
        })
      ]);

      res.json({
        success: true,
        data: {
          ...user.toObject(),
          performance: {
            activeTasks,
            completedTasks,
            totalTasks,
            completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching chef user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chef user'
      });
    }
  },

  // Create new chef user (chef manager only)
  async createChefUser(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { name, email, passwordHash, phone, role = 'chef' } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Validate chef role
      if (!['chef', 'chef_manager'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be chef or chef_manager'
        });
      }

      const newUser = new User({
        name,
        email,
        passwordHash,
        phone,
        role,
        isActive: true
      });

      await newUser.save();

      res.status(201).json({
        success: true,
        message: 'Chef user created successfully',
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating chef user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create chef user'
      });
    }
  },

  // Update chef user (chef manager only for role changes, chefs can update their own profile)
  async updateChefUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, role, isActive } = req.body;

      // Check permission
      if (req.user.role === 'chef' && id !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const user = await User.findById(id);
      if (!user || !['chef', 'chef_manager'].includes(user.role)) {
        return res.status(404).json({
          success: false,
          message: 'Chef user not found'
        });
      }

      const updateData = {};
      
      // Regular chefs can only update their basic info
      if (req.user.role === 'chef') {
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        
        // Cannot change email, role, or status
      } else {
        // Chef managers can update everything
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (role && ['chef', 'chef_manager'].includes(role)) {
          updateData.role = role;
        }
        if (typeof isActive === 'boolean') {
          updateData.isActive = isActive;
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).select('-passwordHash');

      res.json({
        success: true,
        message: 'Chef user updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error updating chef user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update chef user'
      });
    }
  },

  // Toggle chef user status (chef manager only)
  async toggleChefUserStatus(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const { id } = req.params;

      const user = await User.findById(id);
      if (!user || !['chef', 'chef_manager'].includes(user.role)) {
        return res.status(404).json({
          success: false,
          message: 'Chef user not found'
        });
      }

      // Prevent deactivating self
      if (id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: `Chef user ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Error toggling chef user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle chef user status'
      });
    }
  },

  // Delete chef user (chef manager only)
  async deleteChefUser(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const { id } = req.params;

      const user = await User.findById(id);
      if (!user || !['chef', 'chef_manager'].includes(user.role)) {
        return res.status(404).json({
          success: false,
          message: 'Chef user not found'
        });
      }

      // Prevent deleting self
      if (id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Check if chef has active tasks
      const KitchenTask = require('../../models/KitchenTask');
      const activeTasks = await KitchenTask.countDocuments({
        assignedChef: id,
        status: { $in: ['assigned', 'in_progress'] }
      });

      if (activeTasks > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete chef with active tasks. Please reassign tasks first.'
        });
      }

      await User.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Chef user deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting chef user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete chef user'
      });
    }
  },

  // Get chef user statistics (chef manager only)
  async getChefUserStats(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const [
        totalChefs,
        activeChefs,
        chefManagers,
        regularChefs
      ] = await Promise.all([
        User.countDocuments({ role: { $in: ['chef', 'chef_manager'] } }),
        User.countDocuments({ role: { $in: ['chef', 'chef_manager'] }, isActive: true }),
        User.countDocuments({ role: 'chef_manager', isActive: true }),
        User.countDocuments({ role: 'chef', isActive: true })
      ]);

      // Get workload distribution
      const KitchenTask = require('../../models/KitchenTask');
      const workloadStats = await User.aggregate([
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
          $group: {
            _id: null,
            totalActiveChefs: { $sum: 1 },
            avgWorkload: { $avg: { $size: '$activeTasks' } },
            maxWorkload: { $max: { $size: '$activeTasks' } }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalChefs,
            activeChefs,
            inactiveChefs: totalChefs - activeChefs,
            chefManagers,
            regularChefs
          },
          workload: workloadStats[0] || {
            totalActiveChefs: 0,
            avgWorkload: 0,
            maxWorkload: 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching chef user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chef user statistics'
      });
    }
  },

  // Get individual chef statistics
  async getIndividualChefStats(req, res) {
    try {
      const { id } = req.params;

      // Check permission: chefs can view their own stats, managers can view all
      if (req.user.role === 'chef' && id !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const user = await User.findById(id);
      if (!user || !['chef', 'chef_manager'].includes(user.role)) {
        return res.status(404).json({
          success: false,
          message: 'Chef user not found'
        });
      }

      // Get performance metrics
      const KitchenTask = require('../../models/KitchenTask');
      const [activeTasks, completedTasks, totalTasks] = await Promise.all([
        KitchenTask.countDocuments({
          assignedChef: id,
          status: { $in: ['assigned', 'in_progress'] }
        }),
        KitchenTask.countDocuments({
          assignedChef: id,
          status: 'completed'
        }),
        KitchenTask.countDocuments({
          assignedChef: id
        })
      ]);

      res.json({
        success: true,
        data: {
          performance: {
            activeTasks,
            completedTasks,
            totalTasks,
            completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
          }
        }
      });
    } catch (error) {
      console.error('Error fetching individual chef stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chef statistics'
      });
    }
  }
};

module.exports = chefUserController;
