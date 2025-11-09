'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: authRegister } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<RegisterFormData>();

  const watchPassword = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone
      };

      const result = await authRegister(userData);
      if (result.success) {
        toast.success('Registration successful!');
        router.push('/');
      } else {
        setError('root', { message: result.message });
        toast.error(result.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = 'An unexpected error occurred';
      setError('root', { message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 font-display font-bold text-2xl text-primary-700 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span>EatFreshly</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join the EatFreshly Pre-Launch!</h2>
          <p className="text-gray-600">Be among the first to experience healthy dining revolution</p>
          
          {/* Pre-Launch Banner */}
          <div className="bg-gradient-to-r from-primary-500 to-green-500 text-white rounded-lg p-4 mt-4 mb-6">
            <div className="text-center">
              <div className="text-sm font-semibold mb-1">🎉 EXCLUSIVE PRE-LAUNCH OFFER</div>
              <div className="text-lg font-bold">50% OFF + FREE Delivery for First Month!</div>
              <div className="text-sm opacity-90 mt-1">Limited to first 100 members • Launching March 1, 2026</div>
            </div>
          </div>
        </div>

        {/* Pre-Launch Benefits */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Pre-Launch Member Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="font-semibold text-gray-900">50% Discount</div>
              <div className="text-sm text-gray-600">On all orders for your first month</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🚚</span>
              </div>
              <div className="font-semibold text-gray-900">FREE Delivery</div>
              <div className="text-sm text-gray-600">Free delivery for your first month</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">👑</span>
              </div>
              <div className="font-semibold text-gray-900">VIP Status</div>
              <div className="text-sm text-gray-600">Priority ordering & exclusive menu items</div>
            </div>
          </div>
          <div className="text-center mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-yellow-800">
              <span className="font-semibold">⏰ Limited Time:</span> Only available to first 100 pre-launch members!
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="label">
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Name cannot exceed 100 characters'
                    }
                  })}
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="error-text">{errors.name.message}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="label">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone', {
                    pattern: {
                      value: /^\+?[\d\s-()]+$/,
                      message: 'Invalid phone number format'
                    }
                  })}
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="error-text">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="label">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div>
                <label className="label">
                  <Lock className="w-4 h-4 mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-text">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="label">
                  <Lock className="w-4 h-4 mr-2" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === watchPassword || 'Passwords do not match'
                  })}
                  className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full btn-lg"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                'Join Pre-Launch & Get 50% OFF'
              )}
            </button>
            
            {/* Pre-Launch Terms */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By joining, you'll be notified when we launch on March 1, 2026 and 
                automatically receive your pre-launch benefits.
              </p>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.root.message}</p>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-primary-600 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
