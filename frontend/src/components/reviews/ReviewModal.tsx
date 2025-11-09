'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Package } from 'lucide-react';
import { reviewsAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  quantity: number;
  menuItemId: {
    _id: string;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  items: MenuItem[];
}

interface MenuItemRating {
  menuItemId: string;
  rating: number;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  menuItems: MenuItemRating[];
  isAnonymous: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: (refreshNeeded?: boolean) => void;
  order: Order | null;
  existingReview?: Review | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, order, existingReview = null }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    menuItems: [] as MenuItemRating[],
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating,
        comment: existingReview.comment,
        menuItems: existingReview.menuItems || [],
        isAnonymous: existingReview.isAnonymous || false
      });
    } else if (order?.items) {
      // Initialize menu items rating if it's a new review
      setFormData(prev => ({
        ...prev,
        menuItems: order.items.map(item => ({
          menuItemId: item.menuItemId._id,
          rating: 5
        }))
      }));
    }
  }, [existingReview, order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.comment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters long');
      return;
    }

    if (!order) return;

    setIsSubmitting(true);
    try {
      const reviewData = {
        orderId: order._id,
        ...formData
      };

      if (existingReview) {
        await reviewsAPI.update(existingReview._id, reviewData);
        toast.success('Review updated successfully!');
      } else {
        await reviewsAPI.create(reviewData);
        toast.success('Review submitted successfully!');
      }

      onClose(true); // Pass true to indicate refresh needed
    } catch (error: any) {
      console.error('Review submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleMenuItemRatingChange = (menuItemId: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.map(item =>
        item.menuItemId === menuItemId ? { ...item, rating } : item
      )
    }));
  };

  const renderStars = (rating: number, onStarClick: (rating: number) => void, onStarHover?: (rating: number) => void, size = 'w-6 h-6') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (onStarHover ? hoveredRating || rating : rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onStarClick(star)}
              onMouseEnter={() => onStarHover?.(star)}
              onMouseLeave={() => onStarHover?.(0)}
              className={`${size} transition-colors duration-200 focus:outline-none`}
            >
              <Star
                className={`w-full h-full ${
                  isActive ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
          className="absolute inset-0 bg-black bg-opacity-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {existingReview ? 'Edit Review' : 'Write a Review'}
              </h2>
              <p className="text-gray-600 mt-1">
                Order #{order?.orderNumber} • {order?.items?.length} item{order?.items?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => onClose()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Overall Rating */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-3">
                Overall Rating
              </div>
              <div className="flex items-center space-x-4">
                {renderStars(
                  formData.rating,
                  handleRatingChange,
                  setHoveredRating,
                  'w-8 h-8'
                )}
                <span className="text-lg font-semibold text-gray-700">
                  {hoveredRating || formData.rating} star{(hoveredRating || formData.rating) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Individual Menu Items Rating */}
            {order?.items && order.items.length > 0 && (
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-3">
                  Rate Individual Items (Optional)
                </div>
                <div className="space-y-3">
                  {order.items.map((item, index) => {
                    const menuItemRating = formData.menuItems.find(
                      mi => mi.menuItemId === item.menuItemId._id
                    )?.rating || 5;

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        {renderStars(
                          menuItemRating,
                          (rating) => handleMenuItemRatingChange(item.menuItemId._id, rating),
                          undefined,
                          'w-5 h-5'
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comment */}
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="review-comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Share your experience with this order..."
                required
                minLength={10}
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Minimum 10 characters</span>
                <span>{formData.comment.length}/500</span>
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Submit review anonymously
              </label>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span>{order ? new Date(order.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">₹{order?.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">{order?.status}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onClose()}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formData.comment.trim().length < 10}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewModal;
