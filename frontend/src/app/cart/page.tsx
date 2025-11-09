'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { cartAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  menuItemId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isVegan?: boolean;
    isGlutenFree?: boolean;
  };
  quantity: number;
}

interface CartData {
  cart: {
    _id: string;
    items: CartItem[];
  };
  totalPrice: string;
}

const CartPage = () => {
  const { updateCart, isAuthenticated } = useAuth();
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, router]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      if (response.data.success) {
        setCartData(response.data.data);
        updateCart(response.data.data.cart);
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await cartAPI.update(itemId, { quantity: newQuantity });
      if (response.data.success) {
        setCartData(response.data.data);
        updateCart(response.data.data.cart);
        toast.success('Cart updated');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));

    try {
      const response = await cartAPI.remove(itemId);
      if (response.data.success) {
        setCartData(response.data.data);
        updateCart(response.data.data.cart);
        toast.success('Item removed from cart');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartAPI.clear();
      if (response.data.success) {
        setCartData(response.data.data);
        updateCart(response.data.data.cart);
        toast.success('Cart cleared');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    }
  };

  const handleCheckout = () => {
    if (!cartData?.cart?.items?.length) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading your cart..." />
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const cart = cartData?.cart;
  const totalPrice = parseFloat(cartData?.totalPrice || '0');

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 page-transition">
        <div className="container py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Your <span className="text-gradient">Shopping Cart</span>
            </h1>
            <p className="text-xl text-gray-600">
              Review your healthy selections before checkout
            </p>
          </motion.div>

          {cart?.items?.length && cart.items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Clear Cart Button */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Cart Items ({cart.items.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cart
                  </button>
                </div>

                <AnimatePresence>
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.menuItemId?.imageUrl}
                            alt={item.menuItemId?.name}
                            className="w-full sm:w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Item Details */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div className="mb-4 sm:mb-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {item.menuItemId?.name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {item.menuItemId?.category}
                              </p>
                              <div className="flex items-center space-x-2">
                                {item.menuItemId?.isVegan && (
                                  <span className="badge badge-green">Vegan</span>
                                )}
                                {item.menuItemId?.isGlutenFree && (
                                  <span className="badge badge-blue">Gluten Free</span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{item.menuItemId?.price}
                              </p>
                              <p className="text-sm text-gray-500">per item</p>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating[item._id]}
                                className="btn btn-outline btn-sm w-8 h-8 p-0 disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
                                {updating[item._id] ? (
                                  <LoadingSpinner size="sm" text="" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={item.quantity >= 20 || updating[item._id]}
                                className="btn btn-outline btn-sm w-8 h-8 p-0 disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary-600">
                                  ₹{(item.menuItemId?.price * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">subtotal</p>
                              </div>
                              
                              <button
                                onClick={() => removeItem(item._id)}
                                disabled={updating[item._id]}
                                className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 sticky top-8"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹{(totalPrice * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{(totalPrice * 1.08).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="btn btn-primary w-full btn-lg mb-4"
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>

                  <Link
                    href="/menu"
                    className="btn btn-secondary w-full"
                  >
                    Continue Shopping
                  </Link>

                  {/* Delivery Info */}
                  <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-primary-700 mb-2">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-medium">Free Delivery</span>
                    </div>
                    <p className="text-sm text-primary-600">
                      Enjoy free delivery on all orders. Your healthy meals will be delivered 
                      fresh within 30-45 minutes.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            /* Empty Cart */
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-8">
                  Looks like you haven't added any healthy meals to your cart yet. 
                  Start exploring our delicious menu!
                </p>
                <Link
                  href="/menu"
                  className="btn btn-primary btn-lg"
                >
                  Browse Menu
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
