'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Leaf, Shield, Heart, ChefHat, Award, MessageSquare, Mail, User, Phone } from 'lucide-react';
import { menuAPI, promotionsAPI, newsletterAPI } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReviewCarousel from '@/components/reviews/ReviewCarousel';
import MainLayout from '@/components/layout/MainLayout';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [signatureDishes, setSignatureDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterData, setNewsletterData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuResponse, promotionsResponse, signatureResponse] = await Promise.all([
          menuAPI.getAll({ limit: 6 }),
          promotionsAPI.getAll(),
          menuAPI.getAll({ isSignature: 'true', limit: 3 })
        ]);

        if (menuResponse.data.success) {
          setFeaturedItems(menuResponse.data.data.items);
        }

        if (promotionsResponse.data.success) {
          setPromotions(promotionsResponse.data.data.promotions.slice(0, 3));
        }

        if (signatureResponse.data.success) {
          setSignatureDishes(signatureResponse.data.data.items);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewsletterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewsletterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterData.email) {
      toast.error('Email is required');
      return;
    }

    setSubscribing(true);
    try {
      const response = await newsletterAPI.subscribe(newsletterData);
      if (response.data.success) {
        toast.success('Successfully subscribed to newsletter!');
        setNewsletterData({
          email: '',
          name: '',
          phone: ''
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to subscribe to newsletter';
      toast.error(message);
    } finally {
      setSubscribing(false);
    }
  };

  const features = [
    {
      icon: Leaf,
      title: 'Fresh & Organic',
      description: 'Locally sourced, organic ingredients delivered fresh daily'
    },
    {
      icon: Shield,
      title: 'Health Certified',
      description: 'All our meals are nutritionist approved and health certified'
    },
    {
      icon: Clock,
      title: 'Quick Delivery',
      description: 'Fast delivery within 30-45 minutes to your doorstep'
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every dish is prepared with care and passion for healthy living'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '50+', label: 'Healthy Dishes' },
    { number: '4.9', label: 'Average Rating' },
    { number: '30min', label: 'Delivery Time' }
  ];

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-transition">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-green-50 overflow-hidden">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Nourish Your Body with{' '}
                    <span className="text-gradient">Healthy Delights</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Experience the perfect blend of taste and nutrition with our carefully crafted organic meals, 
                    delivered fresh to your doorstep.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="btn btn-primary btn-lg inline-flex items-center"
                  >
                    Join Pre-Launch
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    href="/promotions"
                    className="btn btn-secondary btn-lg"
                  >
                    Early Bird Offers
                  </Link>
                </div>

                {/* Quick Stats - Hidden for now */}
                {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-2xl font-bold text-primary-600">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </div> */}
              </motion.div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=600&fit=crop"
                    alt="Healthy Bowl"
                    className="rounded-2xl shadow-2xl w-full h-auto"
                  />
                  
                  {/* Floating Rating Card - Hidden for now */}
                  {/* <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">4.9</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">10,000+ Reviews</p>
                  </div> */}

                  {/* Floating Delivery Card - Hidden for now */}
                  {/* <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-semibold text-gray-900">30-45 min</p>
                        <p className="text-sm text-gray-600">Delivery</p>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-green-100 rounded-2xl transform rotate-6 scale-110 -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose <span className="text-gradient">EatFreshly</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're committed to providing you with the freshest, most nutritious meals that fuel your body and delight your taste buds.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-green-600 rounded-xl flex items-center justify-center mx-auto">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Menu Release Section */}
        <section className="section bg-gradient-to-br from-primary-600 to-green-600 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <ChefHat className="w-4 h-4 mr-2" />
                Exciting News
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Our Full Menu Launches Soon!
              </h2>
              
              <div className="max-w-3xl mx-auto mb-12">
                <p className="text-xl text-white/90 mb-8">
                  Get ready to explore our complete collection of nutritious and delicious meals. 
                  Our chefs have been working tirelessly to create the perfect menu for your healthy lifestyle.
                </p>
                
                {/* Countdown/Date Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 mr-3" />
                    <span className="text-lg font-semibold uppercase tracking-wide">Menu Release Date</span>
                  </div>
                  
                  <div className="text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    February 1, 2026
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-lg">Mark Your Calendar</span>
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>
              </div>

              {/* What to Expect */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <Leaf className="w-10 h-10 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">10+ Healthy Dishes</h3>
                  <p className="text-white/80">
                    From power bowls to gourmet salads, something for every taste
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <Award className="w-10 h-10 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Chef's Specials</h3>
                  <p className="text-white/80">
                    Exclusive signature dishes crafted by our master chefs
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <Heart className="w-10 h-10 mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-2">Dietary Options</h3>
                  <p className="text-white/80">
                    Vegan, keto, gluten-free, and customizable meal plans
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-10"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                >
                  Get Notified When Menu Drops
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <p className="text-white/80 text-sm mt-4">
                  Join our pre-launch list and get exclusive early access to the menu
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pre-Launch Section */}
        <section className="section bg-gradient-to-br from-gray-50 to-primary-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Clock className="w-4 h-4 mr-2" />
                Coming Soon
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                We're <span className="text-gradient">Almost Ready</span>!
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                EatFreshly is preparing something extraordinary for you. Get ready to experience the future of healthy dining with our carefully curated menu of organic, nutritious, and delicious meals.
              </p>
              
              {/* Launch Date */}
              <div className="bg-white rounded-2xl shadow-soft p-8 mb-12 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Official Launch Date</h3>
                <div className="text-4xl lg:text-6xl font-bold text-gradient mb-2">
                  March 1, 2026
                </div>
                <p className="text-gray-600">Mark your calendars and be ready for the healthy food revolution!</p>
              </div>
            </motion.div>

            {/* Menu Preview Hints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-soft p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Power Bowls</h3>
                <p className="text-gray-600 mb-4">
                  Nutrient-dense superfood bowls packed with quinoa, fresh vegetables, lean proteins, and house-made dressings for sustained energy.
                </p>
                <div className="text-sm text-primary-600 font-semibold">Coming Soon</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-soft p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Heart-Healthy Meals</h3>
                <p className="text-gray-600 mb-4">
                  Carefully crafted dishes rich in omega-3s, antioxidants, and fiber to support cardiovascular health and overall wellness.
                </p>
                <div className="text-sm text-primary-600 font-semibold">Coming Soon</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-soft p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Chef's Specials</h3>
                <p className="text-gray-600 mb-4">
                  Signature creations by our master chefs, featuring seasonal ingredients and innovative flavor combinations you won't find anywhere else.
                </p>
                <div className="text-sm text-primary-600 font-semibold">Coming Soon</div>
              </motion.div>
            </div>

            {/* Pre-Launch Benefits */}
            <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What to Expect from EatFreshly</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">100% Organic</h4>
                  <p className="text-sm text-gray-600 text-center">Locally sourced organic ingredients</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Nutritionist Approved</h4>
                  <p className="text-sm text-gray-600 text-center">Every meal reviewed by experts</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">30-Min Delivery</h4>
                  <p className="text-sm text-gray-600 text-center">Fresh meals delivered fast</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h4>
                  <p className="text-sm text-gray-600 text-center">100% satisfaction promise</p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                href="/register"
                className="btn btn-primary btn-lg mr-4"
              >
                Join Pre-Launch List
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-600 mt-4">
                Be among the first 100 customers and get exclusive early bird discounts!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Subscription Section */}
        <section className="section bg-gradient-to-br from-primary-50 to-green-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Stay Updated with <span className="text-gradient">EatFreshly</span>
                  </h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Subscribe to our newsletter and be the first to know about new menu items, exclusive offers, 
                    healthy recipes, and nutritional tips delivered to your inbox.
                  </p>
                </div>

                <form onSubmit={handleNewsletterSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newsletterData.name}
                        onChange={handleNewsletterChange}
                        placeholder="Your name"
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newsletterData.email}
                        onChange={handleNewsletterChange}
                        placeholder="your@email.com"
                        className="input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newsletterData.phone}
                        onChange={handleNewsletterChange}
                        placeholder="+91 9876543210"
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="btn btn-primary btn-lg px-8"
                    >
                      {subscribing ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          Subscribe Now
                          <Mail className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    By subscribing, you agree to receive marketing communications from EatFreshly. 
                    You can unsubscribe at any time.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pre-Launch CTA Section */}
        <section className="section bg-gradient-to-r from-primary-600 to-green-600 text-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Be Part of the EatFreshly Revolution!
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join our exclusive pre-launch community and be the first to experience the future of healthy dining. 
                Early supporters get special perks and lifetime benefits!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
                >
                  <Award className="mr-2 w-5 h-5" />
                  Join Pre-Launch
                </Link>
                <Link
                  href="/promotions"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
                >
                  <Star className="mr-2 w-5 h-5" />
                  Early Bird Offers
                </Link>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">50%</div>
                  <div className="text-sm opacity-90">Early Bird Discount</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">FREE</div>
                  <div className="text-sm opacity-90">Free Delivery for First Month</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">VIP</div>
                  <div className="text-sm opacity-90">Member Status</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;
