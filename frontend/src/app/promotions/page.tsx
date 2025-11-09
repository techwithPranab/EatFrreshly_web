'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Tag, Calendar, Copy } from 'lucide-react';
import { promotionsAPI } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import toast from 'react-hot-toast';

interface Promotion {
  _id: string;
  title: string;
  description: string;
  promoCode: string;
  discountPercent: number;
  minimumOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  imageUrl?: string;
}

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await promotionsAPI.getAll();
      if (response.data.success) {
        setPromotions(response.data.data.promotions);
      }
    } catch (error: any) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyPromoCode = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode);
    toast.success(`Promo code "${promoCode}" copied to clipboard!`);
  };

  const getDiscountText = (promotion: Promotion) => {
    return `${promotion.discountPercent}% OFF`;
  };

  const isPromotionExpired = (validTo: string) => {
    return new Date(validTo) < new Date();
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading promotions..." />
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
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Special <span className="text-gradient">Promotions</span>
              </h1>
              <p className="text-xl text-gray-600">
                Discover amazing deals and save on your favorite healthy meals
              </p>
            </div>

            {/* Promotions Grid */}
            {promotions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {promotions.map((promotion, index) => (
                  <motion.div
                    key={promotion._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`
                      bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden
                      ${!promotion.isActive || isPromotionExpired(promotion.validTo) ? 'opacity-60' : ''}
                    `}
                  >
                    {/* Promotion Header */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-500 to-green-600 flex items-center justify-center">
                      {promotion.imageUrl ? (
                        <img
                          src={promotion.imageUrl}
                          alt={promotion.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-white">
                          <Gift className="w-16 h-16 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{getDiscountText(promotion)}</p>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                        {getDiscountText(promotion)}
                      </div>

                      {!promotion.isActive || isPromotionExpired(promotion.validTo) ? (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {!promotion.isActive ? 'Inactive' : 'Expired'}
                        </div>
                      ) : (
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {promotion.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {promotion.description}
                      </p>

                      {/* Promo Code */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-700">
                            <Tag className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Code:</span>
                          </div>
                          <button
                            onClick={() => copyPromoCode(promotion.promoCode)}
                            className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-bold"
                          >
                            {promotion.promoCode}
                            <Copy className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="space-y-2 text-xs text-gray-500 mb-4">
                        {promotion.minimumOrderAmount && (
                          <p>• Minimum order: ₹{promotion.minimumOrderAmount}</p>
                        )}
                        {promotion.maxDiscountAmount && (
                          <p>• Maximum discount: ₹{promotion.maxDiscountAmount}</p>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Valid till {formatDate(promotion.validTo)}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => copyPromoCode(promotion.promoCode)}
                        disabled={!promotion.isActive || isPromotionExpired(promotion.validTo)}
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          !promotion.isActive || isPromotionExpired(promotion.validTo)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {!promotion.isActive || isPromotionExpired(promotion.validTo)
                          ? 'Unavailable'
                          : 'Copy & Use Now'
                        }
                      </button>
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
                    <Gift className="w-12 h-12 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    No Promotions Available
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Check back soon for exciting offers!
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PromotionsPage;
