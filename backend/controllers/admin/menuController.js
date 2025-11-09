const MenuItem = require('../../models/MenuItem');
const { validationResult } = require('express-validator');

const adminMenuController = {
  // Get all menu items with pagination and search
  async getMenuItems(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const category = req.query.category || '';
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (category) {
        filter.category = category;
      }

      const total = await MenuItem.countDocuments(filter);
      const menuItems = await MenuItem.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        success: true,
        data: {
          menuItems,
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
      console.error('Error fetching menu items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu items'
      });
    }
  },

  // Get single menu item
  async getMenuItem(req, res) {
    try {
      const menuItem = await MenuItem.findById(req.params.id);
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        data: menuItem
      });
    } catch (error) {
      console.error('Error fetching menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu item'
      });
    }
  },

  // Create new menu item
  async createMenuItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const menuItem = new MenuItem(req.body);
      await menuItem.save();

      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: menuItem
      });
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create menu item'
      });
    }
  },

  // Update menu item
  async updateMenuItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item updated successfully',
        data: menuItem
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update menu item'
      });
    }
  },

  // Delete menu item
  async deleteMenuItem(req, res) {
    try {
      const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete menu item'
      });
    }
  },

  // Toggle menu item availability
  async toggleAvailability(req, res) {
    try {
      const menuItem = await MenuItem.findById(req.params.id);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: 'Menu item not found'
        });
      }

      menuItem.isAvailable = !menuItem.isAvailable;
      await menuItem.save();

      res.json({
        success: true,
        message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
        data: menuItem
      });
    } catch (error) {
      console.error('Error toggling menu item availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle menu item availability'
      });
    }
  },

  // Get menu statistics
  async getMenuStats(req, res) {
    try {
      const totalItems = await MenuItem.countDocuments();
      const activeItems = await MenuItem.countDocuments({ isAvailable: true });
      const inactiveItems = totalItems - activeItems;

      // Get category breakdown
      const categoryStats = await MenuItem.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            total: totalItems,
            active: activeItems,
            inactive: inactiveItems
          },
          categories: categoryStats
        }
      });
    } catch (error) {
      console.error('Error fetching menu stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch menu statistics'
      });
    }
  }
};

module.exports = adminMenuController;
