'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, Truck, User, MapPin, Phone, Mail, Star } from 'lucide-react';
import { ordersAPI, contactAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import ReviewModal from '@/components/reviews/ReviewModal';
import toast from 'react-hot-toast';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: Array<{
    _id: string;
    menuItemId: {
      name: string;
      imageUrl: string;
      price: number;
      _id: string;
    };
    quantity: number;
    price: number;
    name: string;
  }>;
  paymentMethod: string;
  estimatedDeliveryTime?: string;
}

const OrderTrackingPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [contactInfo, setContactInfo] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Fetch contact info on component mount (independent of authentication)
    fetchContactInfo();
    
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderNumber, router]);

  const fetchContactInfo = async () => {
    try {
      const response = await contactAPI.getInfo();
      if (response.data.success) {
        setContactInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Set fallback contact info
      setContactInfo({
        phone: '+91 9876543210',
        email: 'support@healthyrestaurant.com'
      });
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.getById(orderNumber);
      if (response.data.success) {
        setOrder(response.data.data.order);
        // Check for existing review after order is loaded
        setTimeout(() => checkExistingReview(), 100);
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReview = async () => {
    if (!order?._id) return;

    try {
      // Check if user has already reviewed this order
      const response = await ordersAPI.getAll({ limit: 1 });
      if (response.data.success) {
        const userOrders = response.data.data.orders;
        const currentOrder = userOrders.find((o: any) => o._id === order._id);
        if (currentOrder?.review) {
          setExistingReview(currentOrder.review);
        }
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleReviewSubmit = (refreshNeeded = false) => {
    setShowReviewModal(false);
    if (refreshNeeded) {
      fetchOrderDetails();
    }
  };

  const getOrderSteps = () => [
    { 
      key: 'pending', 
      label: 'Order Placed', 
      icon: CheckCircle,
      completed: true 
    },
    { 
      key: 'preparing', 
      label: 'Preparing', 
      icon: Package,
      completed: ['preparing', 'ready', 'out-for-delivery', 'delivered'].includes(order?.status?.toLowerCase() || '')
    },
    { 
      key: 'ready', 
      label: 'Ready', 
      icon: Clock,
      completed: ['ready', 'out-for-delivery', 'delivered'].includes(order?.status?.toLowerCase() || '')
    },
    { 
      key: 'out-for-delivery', 
      label: 'Out for Delivery', 
      icon: Truck,
      completed: ['out-for-delivery', 'delivered'].includes(order?.status?.toLowerCase() || '')
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: CheckCircle,
      completed: order?.status?.toLowerCase() === 'delivered'
    }
  ];

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading order details..." />
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.push('/orders')}
              className="btn btn-primary"
            >
              View All Orders
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const steps = getOrderSteps();
  const currentStepIndex = steps.findIndex(step => step.key === order.status.toLowerCase());

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 page-transition">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Order <span className="text-gradient">Tracking</span>
              </h1>
              <p className="text-xl text-gray-600">
                Order #{order.orderNumber}
              </p>
            </div>

            {/* Order Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const IconComponent = step.icon;
                    const isActive = index === currentStepIndex;
                    const isCompleted = step.completed;

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                          ${isCompleted 
                            ? 'bg-primary-500 border-primary-500 text-white' 
                            : isActive
                              ? 'bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-400'
                          }
                        `}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <p className={`
                          mt-2 text-xs text-center font-medium
                          ${isCompleted ? 'text-primary-600' : 'text-gray-500'}
                        `}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery Time */}
              {order.estimatedDeliveryTime && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center text-primary-700">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      Estimated Delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Details */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900">{order.paymentMethod}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-gray-900 font-semibold">₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                </div>

                {/* Contact Support */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Need Help?</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <a 
                        href={`tel:${contactInfo?.phone || '+91 9876543210'}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {contactInfo?.phone || '+91 9876543210'}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <a 
                        href={`mailto:${contactInfo?.email || 'support@healthyrestaurant.com'}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {contactInfo?.email || 'support@healthyrestaurant.com'}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.menuItemId.imageUrl}
                        alt={item.menuItemId.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {item.menuItemId.name}
                        </h3>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Review Section (if delivered) */}
            {order.status?.toLowerCase() === 'delivered' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  {existingReview ? 'Your Review' : 'Rate Your Order'}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {existingReview
                    ? 'You have already reviewed this order. You can update your review if needed.'
                    : 'How was your experience? Help us improve our service.'
                  }
                </p>

                {existingReview ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= existingReview.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {existingReview.rating} star{existingReview.rating !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 italic">
                      "{existingReview.comment}"
                    </p>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="btn btn-outline btn-sm"
                    >
                      Update Review
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn btn-primary w-full"
                  >
                    Leave a Review
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={handleReviewSubmit}
        order={order}
        existingReview={existingReview}
      />
    </MainLayout>
  );
};

export default OrderTrackingPage;
