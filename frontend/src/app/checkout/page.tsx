'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, Clock, Phone, User, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cartAPI, ordersAPI, promotionsAPI } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import StripePaymentWrapper from '@/components/payment/StripePaymentForm';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  menuItemId: {
    _id: string;
    name: string;
    price: number;
    discountedPrice?: number;
  };
  quantity: number;
}

interface CartData {
  cart: {
    items: CartItem[];
  };
  totalPrice: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  deliveryNotes: string;
  deliveryTime: string;
}

const CheckoutPage = () => {
  const { user, cart, updateCart, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    // Delivery Information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    
    // Order Details
    paymentMethod: 'Credit Card',
    deliveryNotes: '',
    deliveryTime: 'asap'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCartData();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        street: user.address?.street || prev.street,
        city: user.address?.city || prev.city,
        state: user.address?.state || prev.state,
        zipCode: user.address?.zipCode || prev.zipCode,
      }));
    }
  }, [user]);

  const fetchCartData = async () => {
    console.log('Fetching cart data...');
    try {
      const response = await cartAPI.get();
      console.log('Cart data fetched:', response.data);
      if (response.data.success) {
        setCartData(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setValidatingPromo(true);
    try {
      const response = await promotionsAPI.validate({
        promoCode: promoCode.trim(),
        orderAmount: cartData?.totalPrice || 0
      });
      
      if (response.data.success) {
        const discountAmount = response.data.data.discountAmount;
        setDiscount(discountAmount);
        toast.success(`Promo code applied! You saved ₹${discountAmount.toFixed(2)}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid promo code';
      toast.error(message);
      setDiscount(0);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentProcessing(true);
    try {
      const orderData = {
        paymentIntentId,
        orderData: {
          deliveryAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: 'India'
          },
          paymentMethod: formData.paymentMethod,
          deliveryNotes: formData.deliveryNotes,
          promoCode: promoCode.trim() || undefined,
          discountAmount: discount
        }
      };

      const response = await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart after successful order
        await cartAPI.clear();
        updateCart({ items: [], totalPrice: 0, totalItems: 0 });
        toast.success('Order placed successfully!');
        router.push(`/order-tracking/${data.data.order.orderNumber}`);
      } else {
        toast.error(data.message || 'Failed to confirm payment');
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleStripePaymentError = (error: string) => {
    toast.error(error);
    setPaymentProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const items = cartData?.cart?.items || [];
    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items,
        totalPrice: parseFloat(cartData!.totalPrice) - discount,
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'India'
        },
        paymentMethod: formData.paymentMethod,
        deliveryNotes: formData.deliveryNotes,
        promoCode: promoCode.trim() || undefined,
        discountAmount: discount
      };

      const response = await ordersAPI.create(orderData);
      if (response.data.success) {
        // Clear cart after successful order
        await cartAPI.clear();
        updateCart({ items: [], totalPrice: 0, totalItems: 0 });
        toast.success('Order placed successfully!');
        router.push(`/order-tracking/${response.data.data.order.orderNumber}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!cartData) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading checkout..." />
      </MainLayout>
    );
  }

  if (!cartData?.cart?.items?.length) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out</p>
            <button
              onClick={() => router.push('/menu')}
              className="btn btn-primary"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const subtotal = Number(cartData.totalPrice) || 0;
  const deliveryFee = subtotal > 25 ? 0 : 2.99;
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + deliveryFee + tax;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 page-transition">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Information */}
                <div className="card">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                      Delivery Information
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              className="input pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="input pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="input pl-10"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            className="input"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="input"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="input"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className="input"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Notes (Optional)
                        </label>
                        <textarea
                          name="deliveryNotes"
                          value={formData.deliveryNotes}
                          onChange={handleInputChange}
                          rows={3}
                          className="input"
                          placeholder="Any special instructions for delivery..."
                        />
                      </div>
                    </form>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="card">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                      Payment Method
                    </h2>
                    
                    <div className="space-y-3">
                      {[
                        { value: 'Credit Card', label: 'Credit Card (Stripe)' },
                        { value: 'Debit Card', label: 'Debit Card (Stripe)' },
                        { value: 'Digital Wallet', label: 'Digital Wallet (Stripe)' },
                        { value: 'Cash on Delivery', label: 'Cash on Delivery' }
                      ].map((method) => (
                        <label key={method.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.paymentMethod === method.value}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-gray-700">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stripe Payment Form - only show for Stripe payment methods */}
                {['Credit Card', 'Debit Card', 'Digital Wallet'].includes(formData.paymentMethod) && (
                  <div className="card">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                        Payment Details
                      </h2>
                      <StripePaymentWrapper
                        amount={total}
                        orderData={{
                          deliveryAddress: {
                            street: formData.street,
                            city: formData.city,
                            state: formData.state,
                            zipCode: formData.zipCode,
                            country: 'India'
                          },
                          paymentMethod: formData.paymentMethod,
                          deliveryNotes: formData.deliveryNotes,
                          promoCode: promoCode.trim() || undefined,
                          discountAmount: discount
                        }}
                        onSuccess={handleStripePaymentSuccess}
                        onError={handleStripePaymentError}
                        disabled={paymentProcessing}
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Time */}
                <div className="card">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary-600" />
                      Delivery Time
                    </h2>
                    
                    <div className="space-y-3">
                      {[
                        { value: 'asap', label: 'ASAP (30-45 minutes)' },
                        { value: '1hour', label: 'In 1 hour' },
                        { value: '2hours', label: 'In 2 hours' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="deliveryTime"
                            value={option.value}
                            checked={formData.deliveryTime === option.value}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="card">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div className="space-y-3 mb-4">
                      {cartData.cart.items.map((item) => (
                        <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">{item.menuItemId?.name}</h3>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-900 flex flex-col items-end">
                            {item.menuItemId?.discountedPrice && item.menuItemId.discountedPrice < item.menuItemId.price ? (
                              <>
                                <span className="text-primary-600 font-bold">₹{(item.menuItemId.discountedPrice * item.quantity).toFixed(2)}</span>
                                <span className="text-xs text-gray-500 line-through">₹{(item.menuItemId.price * item.quantity).toFixed(2)}</span>
                              </>
                            ) : (
                              <span>₹{(item.menuItemId.price * item.quantity).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Promo Code */}
                    <div className="mb-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Promo code"
                          className="flex-1 input text-sm"
                        />
                        <button
                          onClick={validatePromoCode}
                          disabled={validatingPromo}
                          className="btn btn-outline text-sm px-4"
                        >
                          {validatingPromo ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center mt-2 text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Promo applied: -₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Discount</span>
                          <span className="text-green-600">-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-gray-900">
                          {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-900">₹{tax.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {subtotal < 25 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Add ₹{(25 - subtotal).toFixed(2)} more for free delivery!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Place Order Button - only show for Cash on Delivery */}
                {formData.paymentMethod === 'Cash on Delivery' && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn btn-primary w-full py-4 text-lg font-semibold"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="Placing Order..." />
                    ) : (
                      `Place Order • ₹${total.toFixed(2)}`
                    )}
                  </button>
                )}

                {/* Payment processing message for Stripe */}
                {['Credit Card', 'Debit Card', 'Digital Wallet'].includes(formData.paymentMethod) && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                      Complete your payment using the secure form above. Your order will be placed automatically after successful payment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
