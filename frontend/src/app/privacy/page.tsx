'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, Users, Mail } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Information We Collect",
      content: [
        "Personal information you provide directly (name, email, phone, address)",
        "Order history and preferences",
        "Payment information (processed securely through third-party providers)",
        "Device and browser information for website functionality",
        "Location data for delivery services"
      ]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "How We Use Your Information",
      content: [
        "Process and fulfill your food orders",
        "Provide customer support and respond to inquiries",
        "Send order confirmations and updates",
        "Improve our services and website functionality",
        "Send promotional offers (with your consent)",
        "Ensure food safety and quality standards"
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Security",
      content: [
        "Industry-standard encryption for all data transmission",
        "Secure payment processing through certified providers",
        "Regular security audits and updates",
        "Limited access to personal data on a need-to-know basis",
        "Data backup and disaster recovery procedures"
      ]
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Retention",
      content: [
        "Order records retained for 7 years for tax and legal purposes",
        "Account information maintained while account is active",
        "Marketing preferences honored until unsubscribed",
        "Inactive accounts deleted after 2 years of inactivity",
        "Anonymized data may be retained indefinitely for analytics"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Information Sharing",
      content: [
        "With delivery partners for order fulfillment",
        "With payment processors for transaction processing",
        "With regulatory authorities when required by law",
        "With service providers under strict confidentiality agreements",
        "Never sold to third parties for marketing purposes"
      ]
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Your Rights",
      content: [
        "Access your personal data we hold",
        "Correct inaccurate or incomplete information",
        "Request deletion of your personal data",
        "Opt-out of marketing communications",
        "Data portability to another service",
        "Lodge complaints with supervisory authorities"
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
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Privacy <span className="text-gradient">Policy</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  EatFreshly ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or place orders through our platform.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  By using our services, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  This policy applies to all users of our website, mobile applications, and related services. If you have any questions about this Privacy Policy, please contact us using the information provided at the end of this document.
                </p>
              </div>
            </motion.div>

            {/* Policy Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
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

            {/* Cookies Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-soft p-8 mt-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from. By using our website, you consent to the use of cookies in accordance with this policy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                    <p className="text-sm text-gray-600">Required for basic website functionality, including order processing and account management.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">Help us understand how visitors interact with our website to improve user experience.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">Used to deliver relevant advertisements and track campaign effectiveness.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Preference Cookies</h4>
                    <p className="text-sm text-gray-600">Remember your settings and preferences for future visits.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl p-8 mt-8 text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Your Privacy?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact us. We're here to help and ensure your experience with EatFreshly is both delicious and secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="mailto:privacy@healthyrestaurant.com"
                  className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  privacy@healthyrestaurant.com
                </a>
              </div>
            </motion.div>

            {/* Policy Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gray-50 rounded-xl p-6 mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Policy Updates</h3>
              <p className="text-gray-600 text-sm">
                This Privacy Policy may be updated periodically to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
