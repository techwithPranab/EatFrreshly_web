const Order = require('../../models/Order');
const User = require('../../models/User');

const adminOrderController = {
  // Get all orders with pagination, search, filter, and sorting
  async getOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const status = req.query.status || '';
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

      const filter = {};
      if (search) {
        filter.$or = [
          { orderId: { $regex: search, $options: 'i' } },
          { 'customerName': { $regex: search, $options: 'i' } }
        ];
      }
      if (status) {
        filter.status = status;
      }
      console.log('Filter:', filter);
      const total = await Order.countDocuments(filter);
      console.log('Total orders:', total);
      const orders = await Order.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email');
      console.log('Fetched orders:', orders);
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
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  },

  // Get single order
  async getOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id).populate('userId', 'name email');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  },

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status specified'
        });
      }
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  },

  // Delete order
  async deleteOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      await Order.findByIdAndDelete(req.params.id);
      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete order'
      });
    }
  },

  // Get order statistics
  async getOrderStats(req, res) {
    try {
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
      const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
      const preparingOrders = await Order.countDocuments({ status: 'preparing' });
      const readyOrders = await Order.countDocuments({ status: 'ready' });

      // Recent orders (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

      res.json({
        success: true,
        data: {
          overview: {
            total: totalOrders,
            pending: pendingOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
            preparing: preparingOrders,
            ready: readyOrders,
            recentOrders
          }
        }
      });
    } catch (error) {
      console.error('Error fetching order stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order statistics'
      });
    }
  }
};

module.exports = adminOrderController;
