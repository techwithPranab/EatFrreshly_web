// Utility functions for order status mapping and formatting

/**
 * Maps backend order status to frontend display status
 * @param {string} backendStatus - Status from backend (pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled)
 * @returns {string} Frontend display status
 */
export const mapOrderStatus = (backendStatus) => {
  const statusMap = {
    'pending': 'Placed',
    'confirmed': 'Placed',
    'preparing': 'Preparing',
    'ready': 'Out for Delivery',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };

  return statusMap[backendStatus] || backendStatus;
};

/**
 * Maps frontend display status back to backend status
 * @param {string} frontendStatus - Frontend display status (Placed, Preparing, etc.)
 * @returns {string} Backend status
 */
export const mapFrontendToBackendStatus = (frontendStatus) => {
  const statusMap = {
    'Placed': 'pending',
    'Preparing': 'preparing',
    'Out for Delivery': 'ready',
    'Delivered': 'delivered',
    'Cancelled': 'cancelled'
  };

  return statusMap[frontendStatus] || frontendStatus.toLowerCase();
};

/**
 * Gets status color for UI display
 * @param {string} status - Frontend status
 * @returns {string} Tailwind CSS color class
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'Placed': 'bg-blue-100 text-blue-800',
    'Preparing': 'bg-yellow-100 text-yellow-800',
    'Out for Delivery': 'bg-orange-100 text-orange-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Gets status icon component name
 * @param {string} status - Frontend status
 * @returns {string} Icon component name
 */
export const getStatusIcon = (status) => {
  const iconMap = {
    'Placed': 'Clock',
    'Preparing': 'ChefHat',
    'Out for Delivery': 'Truck',
    'Delivered': 'CheckCircle',
    'Cancelled': 'XCircle'
  };

  return iconMap[status] || 'Clock';
};

/**
 * Gets the step index for order tracking timeline
 * @param {string} status - Frontend status
 * @returns {number} Step index (0-based)
 */
export const getStatusStepIndex = (status) => {
  const stepOrder = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
  return stepOrder.indexOf(status);
};

/**
 * Checks if an order status is considered completed
 * @param {string} status - Frontend status
 * @returns {boolean} Whether the order is completed
 */
export const isOrderCompleted = (status) => {
  return ['Delivered', 'Cancelled'].includes(status);
};

/**
 * Checks if an order can be cancelled
 * @param {string} status - Frontend status
 * @returns {boolean} Whether the order can be cancelled
 */
export const canCancelOrder = (status) => {
  return ['Placed', 'Preparing'].includes(status);
};

/**
 * Formats currency amount
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

/**
 * Formats date for display
 * @param {string|Date} dateString - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Date(dateString).toLocaleDateString('en-US', {
    ...defaultOptions,
    ...options
  });
};
