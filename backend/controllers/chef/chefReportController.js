const ChefService = require('../../services/chefService');
const KitchenTask = require('../../models/KitchenTask');
const Order = require('../../models/Order');
const User = require('../../models/User');

const chefReportController = {
  // Get kitchen performance reports (chef manager only)
  async getKitchenPerformanceReport(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const { startDate, endDate, chefId } = req.query;

      // Get overall kitchen metrics
      const kitchenMetrics = await ChefService.getKitchenMetrics(startDate, endDate);

      // Get performance by chef
      const chefPerformance = await User.aggregate([
        {
          $match: {
            role: { $in: ['chef', 'chef_manager'] },
            isActive: true
          }
        },
        {
          $lookup: {
            from: 'kitchentasks',
            let: { chefId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$assignedChef', '$$chefId'] },
                  ...(startDate && endDate ? {
                    createdAt: {
                      $gte: new Date(startDate),
                      $lte: new Date(endDate)
                    }
                  } : {})
                }
              }
            ],
            as: 'tasks'
          }
        },
        {
          $project: {
            name: 1,
            role: 1,
            totalTasks: { $size: '$tasks' },
            completedTasks: {
              $size: {
                $filter: {
                  input: '$tasks',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            },
            avgPreparationTime: {
              $avg: {
                $map: {
                  input: {
                    $filter: {
                      input: '$tasks',
                      cond: { $gt: ['$$this.totalPreparationTime', 0] }
                    }
                  },
                  as: 'task',
                  in: '$$task.totalPreparationTime'
                }
              }
            }
          }
        },
        {
          $addFields: {
            completionRate: {
              $cond: {
                if: { $gt: ['$totalTasks', 0] },
                then: { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                else: 0
              }
            }
          }
        }
      ]);

      // Get daily performance trend
      const dailyTrend = await KitchenTask.aggregate([
        {
          $match: {
            ...(startDate && endDate ? {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              }
            } : {}),
            ...(chefId ? { assignedChef: chefId } : {})
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            avgPreparationTime: {
              $avg: {
                $cond: [
                  { $gt: ['$totalPreparationTime', 0] },
                  '$totalPreparationTime',
                  null
                ]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Get order completion times by hour
      const hourlyPerformance = await KitchenTask.aggregate([
        {
          $match: {
            status: 'completed',
            actualCompletionTime: { $exists: true },
            ...(startDate && endDate ? {
              createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              }
            } : {})
          }
        },
        {
          $group: {
            _id: { $hour: '$actualCompletionTime' },
            count: { $sum: 1 },
            avgTime: { $avg: '$totalPreparationTime' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      res.json({
        success: true,
        data: {
          overview: kitchenMetrics,
          chefPerformance: chefPerformance,
          dailyTrend: dailyTrend,
          hourlyPerformance: hourlyPerformance
        }
      });
    } catch (error) {
      console.error('Error generating kitchen performance report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate kitchen performance report'
      });
    }
  },

  // Get order analytics (chef manager only)
  async getOrderAnalytics(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const { startDate, endDate } = req.query;

      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Order status distribution
      const statusDistribution = await Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Peak hours analysis
      const peakHours = await Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            orderCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Average preparation time by item category
      const prepTimeByCategory = await KitchenTask.aggregate([
        {
          $match: {
            status: 'completed',
            totalPreparationTime: { $gt: 0 },
            ...dateFilter
          }
        },
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
            avgPrepTime: { $avg: '$totalPreparationTime' },
            orderCount: { $sum: 1 }
          }
        }
      ]);

      // Delay analysis
      const delayAnalysis = await KitchenTask.aggregate([
        {
          $match: {
            status: 'completed',
            totalPreparationTime: { $gt: 0 },
            ...dateFilter
          }
        },
        {
          $addFields: {
            estimatedTime: {
              $sum: {
                $map: {
                  input: '$items',
                  as: 'item',
                  in: { $multiply: ['$$item.preparationTime', '$$item.quantity'] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            isDelayed: { $gt: ['$totalPreparationTime', '$estimatedTime'] },
            delayMinutes: {
              $max: [0, { $subtract: ['$totalPreparationTime', '$estimatedTime'] }]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            delayedOrders: { $sum: { $cond: ['$isDelayed', 1, 0] } },
            avgDelay: {
              $avg: {
                $cond: ['$isDelayed', '$delayMinutes', null]
              }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          statusDistribution: statusDistribution.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          peakHours: peakHours,
          prepTimeByCategory: prepTimeByCategory,
          delayAnalysis: delayAnalysis[0] || {
            totalOrders: 0,
            delayedOrders: 0,
            avgDelay: 0
          }
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

  // Export performance data (chef manager only)
  async exportPerformanceData(req, res) {
    try {
      if (req.user.role !== 'chef_manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Chef manager role required.'
        });
      }

      const { startDate, endDate, format = 'json' } = req.query;

      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const exportData = await KitchenTask.find(dateFilter)
        .populate('assignedChef', 'name')
        .populate('orderId', 'orderNumber totalPrice')
        .select('orderNumber customerName status priority totalPreparationTime createdAt actualStartTime actualCompletionTime')
        .lean();

      if (format === 'csv') {
        // Convert to CSV format
        const csv = [
          'Order Number,Customer Name,Assigned Chef,Status,Priority,Prep Time (min),Created At,Started At,Completed At',
          ...exportData.map(task => [
            task.orderNumber,
            task.customerName,
            task.assignedChef?.name || 'Unassigned',
            task.status,
            task.priority,
            task.totalPreparationTime || 0,
            task.createdAt?.toISOString() || '',
            task.actualStartTime?.toISOString() || '',
            task.actualCompletionTime?.toISOString() || ''
          ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=kitchen-performance.csv');
        return res.send(csv);
      }

      res.json({
        success: true,
        data: exportData
      });
    } catch (error) {
      console.error('Error exporting performance data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export performance data'
      });
    }
  },

  // Get chef individual performance (accessible by chef for their own data)
  async getChefPerformance(req, res) {
    try {
      const { chefId } = req.params;
      const { startDate, endDate } = req.query;

      // Check permission: chefs can only view their own performance
      if (req.user.role === 'chef' && chefId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const performance = await ChefService.getChefPerformance(chefId, startDate, endDate);

      // Get recent completed tasks
      const recentTasks = await KitchenTask.find({
        assignedChef: chefId,
        status: 'completed',
        ...(startDate && endDate ? {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        } : {})
      })
        .populate('orderId', 'orderNumber')
        .sort({ actualCompletionTime: -1 })
        .limit(10)
        .select('orderNumber customerName totalPreparationTime actualCompletionTime');

      res.json({
        success: true,
        data: {
          ...performance,
          recentTasks
        }
      });
    } catch (error) {
      console.error('Error fetching chef performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chef performance'
      });
    }
  }
};

module.exports = chefReportController;
