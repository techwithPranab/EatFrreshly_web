const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import controllers
const adminDashboardController = require('../controllers/admin/dashboardController');
const adminMenuController = require('../controllers/admin/menuController');
const adminUserController = require('../controllers/admin/userController');
const adminReportController = require('../controllers/admin/reportController');
const promotionsController = require('../controllers/admin/promotionsController');
const contactInfoController = require('../controllers/admin/contactInfoController');

// Import middleware (assuming you have these)
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

// Apply auth and admin check to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard Routes
router.get('/dashboard/metrics', adminDashboardController.getDashboardMetrics);
router.get('/dashboard/charts', adminDashboardController.getChartData);
router.get('/dashboard/predictions', adminDashboardController.getAIPredictions);
router.get('/dashboard/activities', adminDashboardController.getRecentActivities);

// Menu Management Routes
router.get('/menu', adminMenuController.getMenuItems);
router.get('/menu/stats', adminMenuController.getMenuStats);
router.get('/menu/:id', adminMenuController.getMenuItem);
router.post('/menu', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').trim().isLength({ min: 2 }).withMessage('Category is required'),
  body('preparationTime').isNumeric().withMessage('Preparation time must be a number')
], adminMenuController.createMenuItem);
router.put('/menu/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('category').optional().trim().isLength({ min: 2 }).withMessage('Category is required'),
  body('preparationTime').optional().isNumeric().withMessage('Preparation time must be a number')
], adminMenuController.updateMenuItem);
router.delete('/menu/:id', adminMenuController.deleteMenuItem);
router.patch('/menu/:id/toggle', adminMenuController.toggleAvailability);

// User Management Routes
router.get('/users', adminUserController.getUsers);
router.get('/users/stats', adminUserController.getUserStats);
router.get('/users/:id', adminUserController.getUser);
router.patch('/users/:id/role', [
  body('role').isIn(['customer', 'chef', 'admin', 'chef_manager']).withMessage('Invalid role')
], adminUserController.updateUserRole);
router.patch('/users/:id/toggle', adminUserController.toggleUserStatus);
router.delete('/users/:id', adminUserController.deleteUser);

// Reports and Analytics Routes
// Reports and Analytics Routes
router.get('/reports/sales', adminReportController.getSalesReport);
router.get('/reports/orders', adminReportController.getOrderAnalytics);
router.get('/reports/customers', adminReportController.getCustomerAnalytics);
router.get('/reports/export', adminReportController.exportData);
router.get('/reports/top-items', adminReportController.getTopItemsReport);
router.get('/reports/user-growth', adminReportController.getUserGrowthReport);
router.get('/reports/category-performance', adminReportController.getCategoryPerformanceReport);
router.get('/reports/order-stats', adminReportController.getOrderStatsReport);

// Promotions Management Routes
// Order Management Routes
const adminOrderController = require('../controllers/admin/orderController');
router.get('/orders', adminOrderController.getOrders);
router.get('/orders/:id', adminOrderController.getOrder);
router.put('/orders/:id', adminOrderController.updateOrderStatus);
router.delete('/orders/:id', adminOrderController.deleteOrder);
router.get('/orders/stats', adminOrderController.getOrderStats);
// Add more as needed (status update, etc)
router.get('/promotions', promotionsController.getPromotions);
router.post('/promotions', promotionsController.createPromotion);
router.put('/promotions/:id', promotionsController.updatePromotion);
router.delete('/promotions/:id', promotionsController.deletePromotion);
router.patch('/promotions/:id/status', promotionsController.togglePromotionStatus);
router.get('/promotions/validate/:code', promotionsController.validatePromotion);

// Contact Info Management Routes
router.get('/contact-info', contactInfoController.getContactInfo);
router.put('/contact-info', [
  body('address').optional().trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('phone').optional().trim().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please enter a valid phone number'),
  body('email').optional().isEmail().withMessage('Please enter a valid email')
], contactInfoController.updateContactInfo);

// Fix missing kitchen tasks for existing orders
router.post('/orders/fix-kitchen-tasks', requireAdmin, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const KitchenTask = require('../models/KitchenTask');
    
    // Find orders without kitchen tasks or with invalid kitchen task references
    const ordersWithoutTasks = await Order.find({
      $or: [
        { kitchenTaskId: null },
        { kitchenTaskId: { $exists: false } }
      ],
      status: { $in: ['pending', 'confirmed', 'preparing'] }
    });
    
    let fixedCount = 0;
    
    for (const order of ordersWithoutTasks) {
      try {
        // Create kitchen tasks for each menu item in the order
        const kitchenTasks = [];
        for (const item of order.items) {
          const kitchenTask = new KitchenTask({
            orderId: order._id,
            menuItem: item.menuItemId,
            quantity: item.quantity,
            status: 'pending',
            estimatedTime: 30,
            priority: 'medium'
          });
          
          const savedTask = await kitchenTask.save();
          kitchenTasks.push(savedTask._id);
        }
        
        // Update the order with kitchen task reference
        if (kitchenTasks.length > 0) {
          await Order.findByIdAndUpdate(order._id, {
            kitchenTaskId: kitchenTasks[0],
            status: order.status === 'pending' ? 'confirmed' : order.status
          });
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error fixing kitchen tasks for order ${order.orderNumber}:`, error);
      }
    }
    
    res.json({
      success: true,
      message: `Fixed kitchen tasks for ${fixedCount} orders`,
      data: { fixedCount, totalChecked: ordersWithoutTasks.length }
    });
  } catch (error) {
    console.error('Error fixing kitchen tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix kitchen tasks'
    });
  }
});

module.exports = router;
