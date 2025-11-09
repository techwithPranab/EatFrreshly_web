
const Order = require('../../models/Order');
const User = require('../../models/User');
const MenuItem = require('../../models/MenuItem');

const adminReportController = {
  // Top Items Report
  getTopItemsReport: async (req, res) => {
    res.json({ success: true, data: { topItems: [] } });
  },

  // User Growth Report
  getUserGrowthReport: async (req, res) => {
    res.json({ success: true, data: { userGrowth: [] } });
  },

  // Category Performance Report
  getCategoryPerformanceReport: async (req, res) => {
    res.json({ success: true, data: { categoryPerformance: [] } });
  },

  // Order Stats Report
  getOrderStatsReport: async (req, res) => {
    res.json({ success: true, data: { orderStats: {} } });
  },
  // Get sales reports with date range filtering
  async getSalesReport(req, res) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      
      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // Only include completed orders
      dateFilter.status = { $in: ['delivered', 'completed'] };

      // Group by day, week, or month
      let groupFormat;
      switch (groupBy) {
        case 'week':
          groupFormat = { $dateToString: { format: "%Y-W%U", date: "$createdAt" } };
          break;
        case 'month':
          groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
          break;
        default: // day
          groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      }

      const salesData = await Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: groupFormat,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get top-selling items in the date range
      const topItems = await Order.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.menuItem',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        {
          $lookup: {
            from: 'menuitems',
            localField: '_id',
            foreignField: '_id',
            as: 'menuItem'
          }
        },
        { $unwind: '$menuItem' },
        {
          $project: {
            name: '$menuItem.name',
            category: '$menuItem.category',
            totalQuantity: 1,
            totalRevenue: 1
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ]);

      // Calculate summary statistics
      const totalOrders = salesData.reduce((sum, item) => sum + item.totalOrders, 0);
      const totalRevenue = salesData.reduce((sum, item) => sum + item.totalRevenue, 0);
      const avgOrderValue = totalRevenue / totalOrders || 0;

      res.json({
        success: true,
        data: {
          summary: {
            totalOrders,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
            period: { startDate, endDate, groupBy }
          },
          salesData,
          topItems
        }
      });
    } catch (error) {
      console.error('Error generating sales report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate sales report'
      });
    }
  },

  // Get order analytics
  async getOrderAnalytics(req, res) {
    try {
      const { period = '30' } = req.query; // days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      // Order status distribution
      const statusStats = await Order.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Orders by time of day
      const hourlyStats = await Order.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Category performance
      const categoryStats = await Order.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'menuitems',
            localField: 'items.menuItem',
            foreignField: '_id',
            as: 'menuItem'
          }
        },
        { $unwind: '$menuItem' },
        {
          $group: {
            _id: '$menuItem.category',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          period: `${period} days`,
          statusDistribution: statusStats,
          hourlyTrends: hourlyStats,
          categoryPerformance: categoryStats
        }
      });
    } catch (error) {
      console.error('Error generating order analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate order analytics'
      });
    }
  },

  // Get customer analytics
  async getCustomerAnalytics(req, res) {
    try {
      const { period = '30' } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      // Customer acquisition
      const newCustomers = await User.countDocuments({
        role: 'customer',
        createdAt: { $gte: daysAgo }
      });

      // Top customers by order count
      const topCustomersByOrders = await Order.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: '$customer' },
        {
          $project: {
            name: '$customer.name',
            email: '$customer.email',
            orderCount: 1,
            totalSpent: 1,
            avgOrderValue: { $divide: ['$totalSpent', '$orderCount'] }
          }
        },
        { $sort: { orderCount: -1 } },
        { $limit: 10 }
      ]);

      // Customer retention rate (simplified)
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const activeCustomers = await Order.distinct('user', {
        createdAt: { $gte: daysAgo }
      });

      const retentionRate = ((activeCustomers.length / totalCustomers) * 100).toFixed(2);

      res.json({
        success: true,
        data: {
          period: `${period} days`,
          newCustomers,
          totalCustomers,
          activeCustomers: activeCustomers.length,
          retentionRate: parseFloat(retentionRate),
          topCustomers: topCustomersByOrders
        }
      });
    } catch (error) {
      console.error('Error generating customer analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate customer analytics'
      });
    }
  },

  // Export data (simplified - returns JSON, can be extended for CSV/PDF)
  async exportData(req, res) {
    try {
      const { type, startDate, endDate } = req.query;

      let data = {};
      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      switch (type) {
        case 'orders':
          data = await Order.find(dateFilter)
            .populate('user', 'name email')
            .populate('items.menuItem', 'name category')
            .sort({ createdAt: -1 });
          break;
        case 'users':
          data = await User.find({}).select('-password');
          break;
        case 'menu':
          data = await MenuItem.find({});
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type'
          });
      }

      res.json({
        success: true,
        data,
        meta: {
          type,
          exportDate: new Date(),
          count: Array.isArray(data) ? data.length : 1
        }
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data'
      });
    }
  }
};

module.exports = adminReportController;
