'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Leaf, Plus, Minus } from 'lucide-react';
import { menuAPI, cartAPI } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MainLayout from '@/components/layout/MainLayout';
import toast from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isAvailable: boolean;
  isSignature: boolean;
  preparationTime: number;
  rating: number;
  reviewCount: number;
}

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    fetchMenuData();
    fetchCart();
  }, []);

  const fetchMenuData = async () => {
    try {
      const [menuResponse, categoriesResponse] = await Promise.all([
        menuAPI.getAll(),
        menuAPI.getCategories()
      ]);

      if (menuResponse.data.success) {
        setMenuItems(menuResponse.data.data.items);
      }

      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data.categories);
      }
    } catch (error: any) {
      console.error('Error fetching menu data:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      if (response.data.success) {
        setCartItems(response.data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (item: MenuItem) => {
    try {
      const response = await cartAPI.add({
        menuItemId: item._id,
        quantity: 1,
        price: item.price
      });

      if (response.data.success) {
        toast.success(`${item.name} added to cart!`);
        fetchCart(); // Refresh cart
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
    }
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cartItems.find(item => item.menuItem._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading menu..." />
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
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Our <span className="text-gradient">Menu</span>
              </h1>
              <p className="text-xl text-gray-600">
                Discover our carefully crafted selection of healthy, delicious meals
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-16 h-16 text-gray-400" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {item.isSignature && (
                          <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                            Signature
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-semibold text-gray-900">
                          {item.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-600 ml-1">
                          ({item.reviewCount})
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        <span className="text-2xl font-bold text-primary-600 ml-2">
                          ₹{item.price}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {item.description}
                      </p>

                      {/* Dietary Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.isVegetarian && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Vegetarian
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Vegan
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Gluten Free
                          </span>
                        )}
                      </div>

                      {/* Nutrition Info */}
                      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.calories}</div>
                          <div className="text-xs text-gray-600">Cal</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.protein}g</div>
                          <div className="text-xs text-gray-600">Protein</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.carbs}g</div>
                          <div className="text-xs text-gray-600">Carbs</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.fat}g</div>
                          <div className="text-xs text-gray-600">Fat</div>
                        </div>
                      </div>

                      {/* Preparation Time */}
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{item.preparationTime} min prep time</span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                          !item.isAvailable
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {!item.isAvailable ? (
                          'Out of Stock'
                        ) : getItemQuantityInCart(item._id) > 0 ? (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add More ({getItemQuantityInCart(item._id)} in cart)
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
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
                    <Leaf className="w-12 h-12 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    No Menu Items Found
                  </h2>
                  <p className="text-gray-600 mb-8">
                    {selectedCategory === 'all'
                      ? 'Our menu is being prepared. Check back soon!'
                      : `No items found in the ${selectedCategory} category.`
                    }
                  </p>
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="btn btn-primary"
                    >
                      View All Items
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MenuPage;