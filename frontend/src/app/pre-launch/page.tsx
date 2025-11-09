'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, ChefHat, ArrowRight, Calendar, Star, Heart, Award, Sparkles, Users, Gift } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const PreLaunchPage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set launch date to March 1, 2026
    const launchDate = new Date('2026-03-01T00:00:00');
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 page-transition">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container flex items-center justify-center min-h-screen py-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-6xl mx-auto"
            >
              {/* Pre-Launch Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-primary-600 to-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold mb-8 shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Coming Soon - Get Ready!
                <Sparkles className="w-5 h-5 ml-2" />
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                The Future of <br />
                <span className="text-gradient">Healthy Dining</span> <br />
                is Almost Here!
              </h1>
              
              <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                EatFreshly is preparing to revolutionize how you experience healthy food. 
                Get ready for organic, nutritious, and absolutely delicious meals delivered fresh to your doorstep.
              </p>

              {/* Countdown Timer */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-16 max-w-4xl mx-auto border border-gray-100">
                <div className="text-center mb-8">
                  <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Official Launch Date</h2>
                  <div className="text-5xl lg:text-6xl font-bold text-gradient mb-4">
                    March 1, 2026
                  </div>
                </div>

                {/* Countdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-primary-600">{timeLeft.days}</div>
                    <div className="text-sm text-gray-600 font-medium">Days</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-green-600">{timeLeft.hours}</div>
                    <div className="text-sm text-gray-600 font-medium">Hours</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600">{timeLeft.minutes}</div>
                    <div className="text-sm text-gray-600 font-medium">Minutes</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <div className="text-3xl lg:text-4xl font-bold text-purple-600">{timeLeft.seconds}</div>
                    <div className="text-sm text-gray-600 font-medium">Seconds</div>
                  </div>
                </div>

                <p className="text-gray-600 text-center">
                  Mark your calendars and be ready for the healthy food revolution!
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What's Coming Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                What's <span className="text-gradient">Coming</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get a sneak peek at what EatFreshly will offer. We're creating something extraordinary just for you.
              </p>
            </motion.div>

            {/* Menu Preview Hints */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center border border-green-200"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Power Bowls Collection</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Nutrient-packed superfood bowls featuring quinoa, fresh organic vegetables, lean proteins, 
                  and our signature house-made dressings crafted by master chefs.
                </p>
                <div className="flex items-center justify-center bg-white rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                  <span className="text-sm text-gray-700 font-semibold">Chef's Special Collection</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border border-blue-200"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Heart-Healthy Meals</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Carefully crafted dishes rich in omega-3s, antioxidants, and fiber designed to support 
                  cardiovascular health while delivering incredible flavors.
                </p>
                <div className="flex items-center justify-center bg-white rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                  <span className="text-sm text-gray-700 font-semibold">Nutritionist Approved</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center border border-purple-200"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Signature Creations</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Innovative flavor combinations featuring seasonal ingredients and unique cooking techniques 
                  you won't find anywhere else in the market.
                </p>
                <div className="flex items-center justify-center bg-white rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                  <span className="text-sm text-gray-700 font-semibold">Exclusive Recipes</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pre-Launch Exclusive Benefits */}
        <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-green-600 text-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-5xl mx-auto"
            >
              <div className="inline-flex items-center bg-white/20 px-6 py-3 rounded-full text-lg font-semibold mb-8">
                <Gift className="w-5 h-5 mr-2" />
                Exclusive Pre-Launch Offer
                <Gift className="w-5 h-5 ml-2" />
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Join Our Pre-Launch Community!
              </h2>
              <p className="text-xl mb-12 opacity-95 max-w-3xl mx-auto">
                Be among the first to experience the EatFreshly revolution and receive incredible early-bird benefits 
                that will never be available again.
              </p>
              
              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="text-4xl lg:text-6xl font-bold mb-2">50%</div>
                  <div className="text-lg font-semibold mb-2">Early Bird Discount</div>
                  <div className="text-sm opacity-90">On all orders for your entire first month</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="text-4xl lg:text-6xl font-bold mb-2">FREE</div>
                  <div className="text-lg font-semibold mb-2">Free Delivery for First Month</div>
                  <div className="text-sm opacity-90">Free delivery for your entire first month</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="text-4xl lg:text-6xl font-bold mb-2">VIP</div>
                  <div className="text-lg font-semibold mb-2">Founding Member Status</div>
                  <div className="text-sm opacity-90">Priority access & exclusive menu items</div>
                </div>
              </div>

              {/* Limited Time Notice */}
              <div className="bg-yellow-400 text-gray-900 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 mr-2" />
                  <span className="font-bold text-lg">Limited Time Only!</span>
                </div>
                <p className="font-semibold">
                  These exclusive benefits are only available to our first 100 pre-launch members. 
                  <span className="block mt-2">Don't miss out on this once-in-a-lifetime opportunity!</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="btn bg-white text-primary-700 hover:bg-gray-100 btn-lg text-xl px-12 py-4 font-bold shadow-xl"
                >
                  <Users className="mr-3 w-6 h-6" />
                  Join Pre-Launch Now
                </Link>
                
                <Link
                  href="/"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-700 btn-lg text-xl px-12 py-4 font-bold"
                >
                  <ArrowRight className="mr-3 w-6 h-6" />
                  Learn More
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why EatFreshly Section */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Why Choose <span className="text-gradient">EatFreshly</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're not just another food delivery service. We're your partner in creating a healthier, 
                more vibrant lifestyle through exceptional nutrition and taste.
              </p>
            </motion.div>

            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl">🌱</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">100% Organic</h3>
                  <p className="text-sm text-gray-600">Locally sourced organic ingredients from trusted farms</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl">👨‍⚕️</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Expert Approved</h3>
                  <p className="text-sm text-gray-600">Every meal reviewed by certified nutritionists</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl">⚡</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-sm text-gray-600">Fresh meals delivered in 30 minutes or less</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl">🏆</div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Promise</h3>
                  <p className="text-sm text-gray-600">100% satisfaction guarantee on every order</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Health?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Don't wait! Join thousands of health enthusiasts who are already preparing for the EatFreshly experience.
              </p>
              
              <Link
                href="/register"
                className="btn bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white btn-lg text-2xl px-16 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="mr-3 w-7 h-7" />
                Secure Your Spot Now
                <Sparkles className="ml-3 w-7 h-7" />
              </Link>

              <p className="text-sm mt-6 opacity-75">
                Limited spots available • No payment required • Cancel anytime before launch
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default PreLaunchPage;
