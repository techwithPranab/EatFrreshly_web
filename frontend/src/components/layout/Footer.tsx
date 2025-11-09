'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { contactAPI } from '../../services/api';

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  additionalInfo: string;
}

const Footer = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await contactAPI.getInfo();
        if (response.data.success) {
          setContactInfo(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
        // Fallback to default values if API fails
        setContactInfo({
          address: 'Barrackpore, 24Pgs(N), West Bengal, 700122',
          phone: '+91-9836027578',
          email: 'freshhealthybite@gmail.com',
          socialMedia: {
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            twitter: 'https://twitter.com',
            linkedin: ''
          },
          additionalInfo: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 font-display font-bold text-xl"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span>EatFreshly</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                Committed to serving fresh, organic, and nutritious meals that nourish your body and delight your taste buds.
              </p>
              <div className="flex space-x-4">
                {contactInfo?.socialMedia.facebook && (
                  <a 
                    href={contactInfo.socialMedia.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {contactInfo?.socialMedia.twitter && (
                  <a 
                    href={contactInfo.socialMedia.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {contactInfo?.socialMedia.instagram && (
                  <a 
                    href={contactInfo.socialMedia.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/" 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                {/* Menu link hidden during pre-launch */}
                {/* <li>
                  <Link 
                    href="/menu" 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Menu
                  </Link>
                </li> */}
                <li>
                  <Link 
                    href="/promotions" 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Promotions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal & Support</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/privacy" 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="/terms" 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="/contact" 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-400 text-sm">
                    {contactInfo?.address || 'Barrackpore, 24Pgs(N), West Bengal, 700122'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <a 
                    href={`tel:${contactInfo?.phone || '+91-9836027578'}`} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {contactInfo?.phone || '+91-9836027578'}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <a 
                    href={`mailto:${contactInfo?.email || 'freshhealthybite@gmail.com'}`} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {contactInfo?.email || 'freshhealthybite@gmail.com'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} EatFreshly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
