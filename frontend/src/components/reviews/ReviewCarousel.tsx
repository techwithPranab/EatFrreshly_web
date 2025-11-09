'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { reviewsAPI } from '@/services/api';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  userId?: { name: string };
  createdAt: string;
  orderId?: {
    orderNumber: string;
    items?: any[];
  };
}

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    fetchTopReviews();
  }, []);

  useEffect(() => {
    if (!autoPlay || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, reviews.length]);

  const fetchTopReviews = async () => {
    try {
      const response = await reviewsAPI.getTop();
      if (response.data.success) {
        setReviews(response.data.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching top reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextReview = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevReview = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const goToReview = (index: number) => {
    setCurrentIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No reviews available yet.</p>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      <div className="relative h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 p-8 flex flex-col justify-center"
          >
            {/* Quote Icon */}
            <div className="mb-4">
              <Quote className="w-8 h-8 text-primary-600" />
            </div>

            {/* Review Content */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                {renderStars(reviews[currentIndex].rating)}
                <span className="text-lg font-semibold text-gray-700">
                  {reviews[currentIndex].rating}.0
                </span>
              </div>

              {/* Comment */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 line-clamp-3">
                "{reviews[currentIndex].comment}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {reviews[currentIndex].isAnonymous 
                      ? 'Anonymous Customer' 
                      : reviews[currentIndex].userId?.name || 'Customer'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(reviews[currentIndex].createdAt)}
                  </p>
                </div>

                {/* Order Info */}
                {reviews[currentIndex].orderId && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      Order #{reviews[currentIndex].orderId.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reviews[currentIndex].orderId.items?.length} item{reviews[currentIndex].orderId.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {reviews.length > 1 && (
          <>
            <button
              onClick={prevReview}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-lg transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextReview}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-primary-600 hover:shadow-lg transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {reviews.length > 1 && (
        <div className="flex justify-center space-x-2 p-4 bg-gray-50">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToReview(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-primary-600 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary-50 opacity-20 pointer-events-none" />
    </div>
  );
};

export default ReviewCarousel;
