'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface NewsletterSubscriptionProps {
  variant?: 'full' | 'compact';
}

interface FormData {
  email: string;
  name: string;
  preferences: {
    newsletter: boolean;
    promotions: boolean;
    orderUpdates: boolean;
    newMenuItems: boolean;
  };
}

const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({ variant = 'full' }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    preferences: {
      newsletter: true,
      promotions: true,
      orderUpdates: true,
      newMenuItems: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/newsletter/subscribe`,
        {
          ...formData,
          source: 'website'
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          email: '',
          name: '',
          preferences: {
            newsletter: true,
            promotions: true,
            orderUpdates: true,
            newMenuItems: true
          }
        });
        toast.success('Successfully subscribed to newsletter!');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Omit<FormData, 'preferences'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (preference: keyof FormData['preferences'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: checked
      }
    }));
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-soft p-8 text-center border border-gray-100">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-600 mb-2">
          Successfully Subscribed!
        </h3>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to our newsletter. You'll receive weekly updates 
          about our latest menu items, special offers, and exclusive promotions.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Subscribe Another Email
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Stay Updated!
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Get weekly menu updates and exclusive offers
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-w-[100px]"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          
          {error && (
            <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-soft p-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <Mail className="w-8 h-8 text-primary-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600">
            Get weekly updates on new menu items, special offers, and restaurant news!
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name (Optional)
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Email Preferences
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose what you'd like to receive from us:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.newsletter}
                onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Weekly Newsletter</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.promotions}
                onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Special Promotions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.orderUpdates}
                onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Order Updates</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.preferences.newMenuItems}
                onChange={(e) => handlePreferenceChange('newMenuItems', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">New Menu Items</span>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
        >
          {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          We respect your privacy. You can unsubscribe at any time by clicking the 
          unsubscribe link in any email or contacting us directly.
        </p>
      </form>
    </div>
  );
};

export default NewsletterSubscription;
