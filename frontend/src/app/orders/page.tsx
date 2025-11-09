'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ordersAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: Array<{
    menuItemId: {
      name: string;
      imageUrl: string;
    };
    quantity: number;
    price: number;
  }>;
}

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasPrev: false,
    hasNext: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router, filter, pagination.current]);

  const fetchOrders = async () => {
    try {
      const params: any = {
        page: pagination.current,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await ordersAPI.getAll(params);
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'preparing':
      case 'cooking':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'preparing':
      case 'cooking':
        return 'text-blue-600 bg-blue-50';
      case 'delivered':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading your orders..." />
      </MainLayout>
    );
  }

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
                Your <span className="text-gradient">Orders</span>
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Track and manage your order history
              </p>
              <p className="text-sm text-gray-500">
                Total Orders: {pagination.total}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'preparing', label: 'Preparing' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-2 capitalize">{order.status}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                          Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>

                        {/* Order Items */}
                        <div className="space-y-2 mb-4">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                              <img
                                src={item.menuItemId.imageUrl}
                                alt={item.menuItemId.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.menuItemId.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Qty: {item.quantity} × ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500 ml-15">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-gray-900">
                            Total: ₹{order.totalPrice.toFixed(2)}
                          </p>
                          <button
                            onClick={() => router.push(`/order-tracking/${order.orderNumber}`)}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    No orders found
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {filter === 'all' 
                      ? "You haven't placed any orders yet. Start exploring our menu!"
                      : `No ${filter} orders found. Try a different filter.`
                    }
                  </p>
                  <button
                    onClick={() => router.push('/menu')}
                    className="btn btn-primary"
                  >
                    Browse Menu
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center space-x-2 mt-8"
            >
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    pagination.current === i + 1
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
