const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

class AIPredictionService {
  /**
   * Simple linear regression for sales prediction
   * In a real-world scenario, you'd use TensorFlow.js or external ML APIs
   */
  static async predictTopSellingItems(daysToPredict = 7) {
    try {
      // Get historical sales data from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await Order.find({
        createdAt: { $gte: thirtyDaysAgo },
        status: { $in: ['delivered', 'completed'] }
      }).populate('items.menuItem');

      // Calculate item sales frequency
      const itemSales = {};
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.menuItem) {
            const itemId = item.menuItem._id.toString();
            const itemName = item.menuItem.name;
            
            if (!itemSales[itemId]) {
              itemSales[itemId] = {
                name: itemName,
                category: item.menuItem.category,
                price: item.menuItem.price,
                totalSold: 0,
                revenue: 0,
                frequency: []
              };
            }
            
            itemSales[itemId].totalSold += item.quantity;
            itemSales[itemId].revenue += item.quantity * item.price;
            itemSales[itemId].frequency.push({
              date: order.createdAt,
              quantity: item.quantity
            });
          }
        });
      });

      // Simple prediction algorithm based on trend analysis
      const predictions = Object.values(itemSales).map(item => {
        const salesTrend = this.calculateSalesTrend(item.frequency);
        const confidence = this.calculateConfidence(item.frequency);
        const predictedSales = Math.max(0, Math.round(item.totalSold * salesTrend));

        return {
          itemName: item.name,
          category: item.category,
          currentSales: item.totalSold,
          predictedSales,
          confidence: Math.round(confidence * 100),
          revenue: item.revenue,
          trend: salesTrend > 1 ? 'increasing' : salesTrend < 1 ? 'decreasing' : 'stable'
        };
      });

      // Sort by predicted sales and return top 10
      return predictions
        .sort((a, b) => b.predictedSales - a.predictedSales)
        .slice(0, 10);

    } catch (error) {
      console.error('AI Prediction Error:', error);
      throw new Error('Failed to generate predictions');
    }
  }

  static calculateSalesTrend(frequency) {
    if (frequency.length < 2) return 1;

    // Simple linear regression to find trend
    const n = frequency.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    frequency.forEach((point, index) => {
      const x = index;
      const y = point.quantity;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return Math.max(0.1, 1 + (slope * 0.1)); // Normalize trend factor
  }

  static calculateConfidence(frequency) {
    if (frequency.length < 3) return 0.5;

    // Calculate variance to determine confidence
    const quantities = frequency.map(f => f.quantity);
    const mean = quantities.reduce((a, b) => a + b, 0) / quantities.length;
    const variance = quantities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / quantities.length;
    
    // Lower variance = higher confidence
    return Math.max(0.3, Math.min(0.95, 1 - (variance / (mean + 1))));
  }

  /**
   * Predict popular categories for a given time period
   */
  static async predictPopularCategories() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const orders = await Order.find({
        createdAt: { $gte: sevenDaysAgo },
        status: { $in: ['delivered', 'completed'] }
      }).populate('items.menuItem');

      const categorySales = {};

      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.menuItem) {
            const category = item.menuItem.category;
            if (!categorySales[category]) {
              categorySales[category] = {
                name: category,
                totalItems: 0,
                totalRevenue: 0
              };
            }
            categorySales[category].totalItems += item.quantity;
            categorySales[category].totalRevenue += item.quantity * item.price;
          }
        });
      });

      return Object.values(categorySales)
        .sort((a, b) => b.totalItems - a.totalItems);

    } catch (error) {
      console.error('Category Prediction Error:', error);
      throw new Error('Failed to predict popular categories');
    }
  }

  /**
   * Generate sales forecast for next month
   */
  static async generateSalesForecast() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await Order.find({
        createdAt: { $gte: thirtyDaysAgo },
        status: { $in: ['delivered', 'completed'] }
      });

      // Group sales by day
      const dailySales = {};
      orders.forEach(order => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        if (!dailySales[dateKey]) {
          dailySales[dateKey] = 0;
        }
        dailySales[dateKey] += order.totalAmount;
      });

      const salesData = Object.values(dailySales);
      const avgDailySales = salesData.reduce((a, b) => a + b, 0) / salesData.length;

      // Simple forecast: assume 5% growth
      const forecast = {
        nextWeek: avgDailySales * 7 * 1.05,
        nextMonth: avgDailySales * 30 * 1.05,
        confidence: 75
      };

      return forecast;

    } catch (error) {
      console.error('Sales Forecast Error:', error);
      throw new Error('Failed to generate sales forecast');
    }
  }
}

module.exports = AIPredictionService;
