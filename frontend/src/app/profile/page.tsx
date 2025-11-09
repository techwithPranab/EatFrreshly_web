'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Save, Edit3, ShoppingBag, Star, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usersAPI, ordersAPI } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  favoriteCategory: string;
  averageRating: number;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'India'
    }
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await usersAPI.getDashboardStats();
      if (response.data.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await usersAPI.updateProfile(profileData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        setEditMode(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await usersAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner text="Loading profile..." />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
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
                Your <span className="text-gradient">Profile</span>
              </h1>
              <p className="text-xl text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Dashboard Stats */}
            {dashboardStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <div className="bg-white rounded-xl p-6 text-center shadow-soft">
                  <ShoppingBag className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</h3>
                  <p className="text-gray-600">Total Orders</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-soft">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">₹{dashboardStats.totalSpent}</h3>
                  <p className="text-gray-600">Total Spent</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-soft">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-gray-900">{dashboardStats.averageRating}</h3>
                  <p className="text-gray-600">Avg. Rating</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-soft">
                  <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-gray-900">{dashboardStats.favoriteCategory}</h3>
                  <p className="text-gray-600">Favorite Category</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Information */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {editMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="label">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input ${!editMode ? 'bg-gray-50' : ''}`}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="label">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input ${!editMode ? 'bg-gray-50' : ''}`}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="label">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!editMode}
                      className={`input ${!editMode ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="label">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="address.street"
                        placeholder="Street Address"
                        value={profileData.address.street}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        className={`input ${!editMode ? 'bg-gray-50' : ''}`}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="address.city"
                          placeholder="City"
                          value={profileData.address.city}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          className={`input ${!editMode ? 'bg-gray-50' : ''}`}
                        />
                        <input
                          type="text"
                          name="address.state"
                          placeholder="State"
                          value={profileData.address.state}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          className={`input ${!editMode ? 'bg-gray-50' : ''}`}
                        />
                      </div>
                      <input
                        type="text"
                        name="address.zipCode"
                        placeholder="ZIP Code"
                        value={profileData.address.zipCode}
                        onChange={handleProfileChange}
                        disabled={!editMode}
                        className={`input ${!editMode ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>

                  {editMode && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary w-full"
                    >
                      {saving ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  )}
                </form>
              </motion.div>

              {/* Change Password */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-soft border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </h2>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input"
                      minLength={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input"
                      minLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn btn-primary w-full"
                  >
                    {changingPassword ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </form>

                {/* Account Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => router.push('/orders')}
                      className="btn btn-secondary w-full"
                    >
                      View Order History
                    </button>
                    <button
                      onClick={() => router.push('/promotions')}
                      className="btn btn-outline w-full"
                    >
                      View Promotions
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
