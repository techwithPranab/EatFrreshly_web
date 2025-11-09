'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, CreditCard, Truck, Shield, AlertTriangle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const TermsOfServicePage = () => {
  const sections = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Accounts",
      content: [
        "You must be at least 18 years old to create an account",
        "You are responsible for maintaining account security",
        "One account per person; multiple accounts are prohibited",
        "Accurate and current information must be provided",
        "Account suspension may occur for policy violations"
      ]
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Orders and Payment",
      content: [
        "All orders are subject to availability and acceptance",
        "Payment must be completed before order processing",
        "Prices may change without prior notice",
        "Refunds processed within 3-5 business days",
        "Payment information is processed securely"
      ]
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Delivery Services",
      content: [
        "Delivery times are estimates, not guarantees",
        "Delivery fees vary by location and order size",
        "Customer must be present for delivery",
        "Special delivery instructions must be provided",
        "Weather conditions may affect delivery times"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Food Safety",
      content: [
        "All meals prepared with fresh, quality ingredients",
        "Allergen information provided where available",
        "Customers responsible for dietary restrictions",
        "Food safety complaints handled promptly",
        "Quality guarantee on all menu items"
      ]
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Prohibited Activities",
      content: [
        "Placing fraudulent or duplicate orders",
        "Harassing delivery personnel or staff",
        "Attempting to circumvent payment systems",
        "Sharing account credentials with others",
        "Using the service for commercial purposes without permission"
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 page-transition">
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Terms of <span className="text-gradient">Service</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Please read these terms carefully before using our services. By using EatFreshly, you agree to be bound by these terms.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Last updated: November 7, 2025
              </p>
            </div>

            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-soft p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement Overview</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  These Terms of Service ("Terms") govern your use of the EatFreshly website, mobile applications, and related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  EatFreshly is operated by EatFreshly Inc. ("we," "our," or "us"). These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Please read these Terms carefully. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
              </div>
            </motion.div>

            {/* Service Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-soft p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  EatFreshly provides an online platform for ordering nutritious, freshly prepared meals for delivery or pickup. Our services include:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                  <li>Online food ordering through our website and mobile applications</li>
                  <li>Secure payment processing for orders</li>
                  <li>Delivery services within our designated service areas</li>
                  <li>Customer support and order tracking</li>
                  <li>Promotional offers and loyalty programs</li>
                  <li>Menu information and nutritional details</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify or discontinue any service at any time without prior notice. We will not be liable if for any reason all or any part of the Service is unavailable at any time or for any period.
                </p>
              </div>
            </motion.div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-soft p-8"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-primary-600">
                        {section.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-soft p-8 mt-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of EatFreshly and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service, except as follows:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4">
                  <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials</li>
                  <li>You may store files that are automatically cached by your Web browser for display enhancement purposes</li>
                  <li>You may print or download one copy of a reasonable number of pages of the Website for your own personal, non-commercial use</li>
                </ul>
              </div>
            </motion.div>

            {/* Termination */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl shadow-soft p-8 mt-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  All provisions of the Terms which by their nature should survive termination shall survive, including, without limitation, ownership provisions, warranty disclaimers, and limitations of liability.
                </p>
              </div>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl shadow-soft p-8 mt-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  In no event shall EatFreshly, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount paid by you to us in the twelve (12) months preceding the claim.
                </p>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl p-8 mt-8 text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                If you have any questions about these Terms of Service, please contact us. We're committed to providing excellent service and addressing any concerns you may have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="mailto:legal@healthyrestaurant.com"
                  className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  legal@healthyrestaurant.com
                </a>
              </div>
            </motion.div>

            {/* Terms Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-gray-50 rounded-xl p-6 mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms Updates</h3>
              <p className="text-gray-600 text-sm">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfServicePage;
