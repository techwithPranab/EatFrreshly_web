'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HeadphonesIcon, ChefHat } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  businessHours: any;
  socialMedia: any;
  additionalInfo?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

const ClientContact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get('/api/contact/info');
      if (response.data.success) {
        setContactInfo(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
    }
  };

  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 30-45 minutes within our service area. During peak hours, it may take up to 60 minutes."
    },
    {
      question: "What are your delivery hours?",
      answer: "We deliver Monday through Thursday from 8:00 AM to 9:00 PM, Friday and Saturday from 8:00 AM to 10:00 PM, and Sunday from 9:00 AM to 8:00 PM."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer refunds for orders that arrive cold, incorrect, or significantly delayed. Please contact us within 24 hours of delivery."
    },
    {
      question: "Can I modify my order after placing it?",
      answer: "Orders can be modified within 5 minutes of placement. Please call us immediately if you need to make changes."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, digital wallets (Apple Pay, Google Pay), and cash for in-person orders."
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer: "Yes, we can accommodate most dietary restrictions. Please mention any allergies or preferences when placing your order."
    }
  ];

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/contact', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 page-transition">
        <div className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeadphonesIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Get in <span className="text-gradient">Touch</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have a question or need assistance? We're here to help you with anything related to your healthy dining experience.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-soft p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Your full name"
                      />
                    </div>

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
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Brief subject"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Write your message here"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="inquiry-general"
                        type="radio"
                        name="inquiryType"
                        checked={formData.inquiryType === 'general'}
                        onChange={() => handleInputChange('inquiryType', 'general')}
                        className="form-radio"
                      />
                      <label htmlFor="inquiry-general" className="text-sm text-gray-700">General Inquiry</label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary">
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Methods</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {(contactInfo ? [
                      {
                        icon: <Phone className="w-6 h-6" />, title: 'Phone Support', description: 'Speak directly with our team', contact: contactInfo.phone, action: `tel:${contactInfo.phone}`
                      },
                      {
                        icon: <Mail className="w-6 h-6" />, title: 'Email Support', description: 'Send us a detailed message', contact: contactInfo.email, action: `mailto:${contactInfo.email}`
                      },
                      {
                        icon: <MessageSquare className="w-6 h-6" />, title: 'Live Chat', description: 'Instant help during business hours', contact: 'Available on website', action: '#'
                      },
                      {
                        icon: <MapPin className="w-6 h-6" />, title: 'Visit Us', description: 'Come to our restaurant', contact: contactInfo.address, action: '#'
                      }
                    ] : [
                      { icon: <Phone className="w-6 h-6" />, title: 'Phone Support', description: 'Speak directly with our team', contact: '+91-9836027578', action: 'tel:+919836027578' },
                      { icon: <Mail className="w-6 h-6" />, title: 'Email Support', description: 'Send us a detailed message', contact: 'freshhealthybite@gmail.com', action: 'mailto:freshhealthybite@gmail.com' },
                      { icon: <MessageSquare className="w-6 h-6" />, title: 'Live Chat', description: 'Instant help during business hours', contact: 'Available on website', action: '#' },
                      { icon: <MapPin className="w-6 h-6" />, title: 'Visit Us', description: 'Come to our restaurant', contact: 'Barrackpore , 24Pgs(N), West Bengal , 700122', action: '#' }
                    ]).map((method, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="p-3 bg-primary-50 rounded-lg">{method.icon}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{method.title}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                          <div className="mt-2 text-sm text-primary-600 font-medium"><a href={method.action}>{method.contact}</a></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <details key={i} className="pb-2 border-b border-gray-100">
                        <summary className="cursor-pointer font-medium">{faq.question}</summary>
                        <div className="mt-2 text-sm text-gray-600">{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6 text-gray-600 text-sm">
                  <h3 className="text-lg font-semibold mb-2">Customer Service Hours</h3>
                  <div>Mon-Fri: 8:00 AM - 8:00 PM</div>
                  <div>Sat-Sun: 9:00 AM - 6:00 PM</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientContact;
