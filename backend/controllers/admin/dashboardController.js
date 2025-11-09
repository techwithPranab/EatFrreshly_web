const Order = require('../../models/Order');
const User = require('../../models/User');
const MenuItem = require('../../models/MenuItem');
const Promotion = require('../../models/Promotion');
const AIPredictionService = require('../../services/aiPredictionService');

const adminDashboardController = {
  // Get main dashboard metrics
  async getDashboardMetrics(req, res) {
    try {
      console.log('Fetching dashboard metrics...');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      console.log('Date ranges:', { today, thisMonth, thisMonthEnd });

      // Today's metrics
      const todayOrders = await Order.countDocuments({
        createdAt: { $gte: today }
      });

      console.log('Today orders count:', todayOrders);

      const todayRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            status: { $in: ['delivered', 'completed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]);

      // This month's metrics
      const monthlyOrders = await Order.countDocuments({
        createdAt: { $gte: thisMonth, $lte: thisMonthEnd }
      });

      const monthlyRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thisMonth, $lte: thisMonthEnd },
            status: { $in: ['delivered', 'completed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPrice' }
          }
        }
      ]);

      // Total customers
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const newCustomersThisMonth = await User.countDocuments({
        role: 'customer',
        createdAt: { $gte: thisMonth }
      });

      // Active menu items
      const activeMenuItems = await MenuItem.countDocuments({ isAvailable: true });
      const totalMenuItems = await MenuItem.countDocuments();

      // Pending orders
      const pendingOrders = await Order.countDocuments({
        status: { $in: ['pending', 'confirmed', 'preparing'] }
      });

      res.json({
        success: true,
        data: {
          today: {
            orders: todayOrders,
            revenue: todayRevenue[0]?.total || 0
          },
          monthly: {
            orders: monthlyOrders,
            revenue: monthlyRevenue[0]?.total || 0,
            newCustomers: newCustomersThisMonth
          },
          overview: {
            totalCustomers,
            activeMenuItems,
            totalMenuItems,
            pendingOrders
          }
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard metrics'
      });
    }
  },

  // Get chart data for dashboard
  async getChartData(req, res) {
    try {
      const { period = '7' } = req.query; // days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));

      // Sales trend (daily revenue)
      const salesTrend = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: daysAgo },
            status: { $in: ['delivered', 'completed'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: '$totalPrice' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Order status distribution
      const orderStatusData = await Order.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Top-selling categories
      const categoryData = await Order.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'menuitems',
            localField: 'items.menuItemId',
            foreignField: '_id',
            as: 'menuItem'
          }
        },
        { $unwind: '$menuItem' },
        {
          $group: {
            _id: '$menuItem.category',
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            quantity: { $sum: '$items.quantity' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        success: true,
        data: {
          salesTrend,
          orderStatus: orderStatusData,
          topCategories: categoryData,
          period: `${period} days`
        }
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chart data'
      });
    }
  },

  // Get AI predictions
  async getAIPredictions(req, res) {
    try {
      const topSellingPredictions = await AIPredictionService.predictTopSellingItems();
      const popularCategories = await AIPredictionService.predictPopularCategories();
      const salesForecast = await AIPredictionService.generateSalesForecast();

      res.json({
        success: true,
        data: {
          topSellingItems: topSellingPredictions,
          popularCategories,
          salesForecast
        }
      });
    } catch (error) {
      console.error('Error fetching AI predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch AI predictions'
      });
    }
  },

  // Get recent activities
  async getRecentActivities(req, res) {
    try {
        console.log('Fetching recent activities');
      const limit = parseInt(req.query.limit) || 10;

      // Recent orders
      const recentOrders = await Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('_id userId totalPrice status createdAt');

      // Recent user registrations
      const recentUsers = await User.find({ role: 'customer' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt');

      // Recent menu additions
      const recentMenuItems = await MenuItem.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category price createdAt');

      res.json({
        success: true,
        data: {
          recentOrders: recentOrders.map(order => ({
            id: order._id,
            customer: order.userId?.name || 'Guest',
            amount: order.totalPrice,
            status: order.status,
            date: order.createdAt
          })),
          recentUsers: recentUsers.map(user => ({
            name: user.name,
            email: user.email,
            joinDate: user.createdAt
          })),
          recentMenuItems: recentMenuItems.map(item => ({
            name: item.name,
            category: item.category,
            price: item.price,
            addedDate: item.createdAt
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activities'
      });
    }
  }
};

module.exports = adminDashboardController;
