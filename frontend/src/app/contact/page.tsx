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
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  additionalInfo?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
}

const ContactPage = () => {
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

  const contactMethods = contactInfo ? [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: contactInfo.phone,
      availability: "Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM",
      action: `tel:${contactInfo.phone}`
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us a detailed message",
      contact: contactInfo.email,
      availability: "Response within 24 hours",
      action: `mailto:${contactInfo.email}`
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Instant help during business hours",
      contact: "Available on website",
      availability: "Mon-Fri: 9AM-7PM",
      action: "#"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      description: "Come to our restaurant",
      contact: contactInfo.address,
      availability: "Mon-Sun: 8AM-9PM",
      action: "#"
    }
  ] : [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      contact: "+91-9836027578",
      availability: "Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM",
      action: "tel:+919836027578"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us a detailed message",
      contact: "freshhealthybite@gmail.com",
      availability: "Response within 24 hours",
      action: "mailto:freshhealthybite@gmail.com"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Instant help during business hours",
      contact: "Available on website",
      availability: "Mon-Fri: 9AM-7PM",
      action: "#"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      description: "Come to our restaurant",
      contact: "Barrackpore , 24Pgs(N), West Bengal , 700122",
      availability: "Mon-Sun: 8AM-9PM",
      action: "#"
    }
  ];

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
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      value={formData.inquiryType}
                      onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="delivery">Delivery Issue</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Contact Methods */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Methods</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {contactMethods.map((method, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-soft p-6 border border-gray-100">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <div className="text-primary-600">
                              {method.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                            <p className="text-primary-600 font-medium mb-1">{method.contact}</p>
                            <p className="text-gray-500 text-xs">{method.availability}</p>
                            {method.action !== "#" && (
                              <a
                                href={method.action}
                                className="inline-flex items-center mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                              >
                                Contact now →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Operating Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {contactInfo ? (
                      <>
                        {Object.entries(contactInfo.businessHours).map(([day, hours]) => {
                          const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                          return !hours.closed ? (
                            <div key={day} className="flex justify-between">
                              <span>{dayName}</span>
                              <span>{hours.open} - {hours.close}</span>
                            </div>
                          ) : (
                            <div key={day} className="flex justify-between">
                              <span>{dayName}</span>
                              <span className="text-red-500">Closed</span>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Monday - Thursday</span>
                          <span>8:00 AM - 9:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Friday - Saturday</span>
                          <span>8:00 AM - 10:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday</span>
                          <span>9:00 AM - 8:00 PM</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Quick answers to common questions about our services, delivery, and policies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-soft p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
