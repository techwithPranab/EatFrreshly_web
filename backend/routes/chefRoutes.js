const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import controllers
const chefOrderController = require('../controllers/chef/chefOrderController');
const chefKitchenController = require('../controllers/chef/chefKitchenController');
const chefReportController = require('../controllers/chef/chefReportController');
const chefUserController = require('../controllers/chef/chefUserController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is chef or chef manager
const requireChef = (req, res, next) => {
  if (req.user && ['chef', 'chef_manager'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Chef role required.'
    });
  }
};

// Middleware to check if user is chef manager
const requireChefManager = (req, res, next) => {
  if (req.user && req.user.role === 'chef_manager') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Chef manager role required.'
    });
  }
};

// Apply auth and chef check to all chef routes
router.use(authenticateToken);
router.use(requireChef);

// Order Management Routes
router.get('/orders/pending', chefOrderController.getPendingOrders);
router.get('/orders/assigned', chefOrderController.getAssignedOrders);
router.post('/orders/accept/:id', [
  body('assignToChef').optional().isMongoId().withMessage('Invalid chef ID')
], chefOrderController.acceptOrder);
router.put('/orders/update/:id', [
  body('status').isIn(['in_progress', 'ready', 'completed']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes too long')
], chefOrderController.updateOrderStatus);

// Kitchen Management Routes
router.get('/kitchen/stats', chefKitchenController.getKitchenStats);
router.get('/kitchen', chefKitchenController.getKitchenTasks);
router.get('/kitchen/:id', chefKitchenController.getKitchenTask);
router.put('/kitchen/:id/status', chefKitchenController.updateKitchenTaskStatus);
router.delete('/kitchen/:id', chefKitchenController.deleteKitchenTask);
router.post('/kitchen/assign', requireChefManager, [
  body('taskId').isMongoId().withMessage('Invalid task ID'),
  body('chefId').isMongoId().withMessage('Invalid chef ID')
], chefKitchenController.assignTaskToChef);

// Reports Routes (Chef Manager Only)
router.get('/reports/performance', requireChefManager, chefReportController.getKitchenPerformanceReport);
router.get('/reports/kitchen', requireChefManager, chefReportController.getKitchenPerformanceReport);
router.get('/reports/orders', requireChefManager, chefReportController.getOrderAnalytics);
router.get('/reports/export', requireChefManager, chefReportController.exportPerformanceData);
router.get('/reports/chef/:chefId', chefReportController.getChefPerformance);

// User Management Routes (Chef Manager Only)
router.get('/users', requireChefManager, chefUserController.getChefUsers);
router.get('/users/stats', requireChefManager, chefUserController.getChefUserStats);
router.get('/users/:id', chefUserController.getChefUser);
router.get('/users/:id/stats', chefUserController.getIndividualChefStats);
router.post('/users', requireChefManager, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('passwordHash').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
  body('role').isIn(['chef', 'chef_manager']).withMessage('Invalid role')
], chefUserController.createChefUser);
router.put('/users/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
  body('role').optional().isIn(['chef', 'chef_manager']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], chefUserController.updateChefUser);
router.patch('/users/:id/toggle', requireChefManager, chefUserController.toggleChefUserStatus);
router.delete('/users/:id', requireChefManager, chefUserController.deleteChefUser);

// Dashboard summary for chef/chef_manager
router.get('/dashboard', chefOrderController.getDashboardData);

module.exports = router;
