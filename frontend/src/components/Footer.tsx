import React from 'react';
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const handleLinkClick = (section: string) => {
    alert(`${section} page would be implemented here!`);
  };

  const handleSocialClick = (platform: string) => {
    alert(`${platform} social media integration would be implemented here!`);
  };

  const handleContactClick = (method: string, value: string) => {
    if (method === 'email') {
      window.location.href = `mailto:${value}`;
    } else if (method === 'phone') {
      window.location.href = `tel:${value}`;
    } else {
      alert(`${method} contact would be implemented here!`);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold">GreenCart</span>
            </div>
            <p className="text-gray-300 mb-4">
              Leading the way in sustainable e-commerce with AI-powered environmental impact optimization.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => handleSocialClick('Facebook')}
                className="text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('Twitter')}
                className="text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('Instagram')}
                className="text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleSocialClick('LinkedIn')}
                className="text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('About Us')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Sustainability')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Sustainability
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('EarthScore')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  EarthScore
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Careers')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Careers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Blog')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleLinkClick('Help Center')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Returns')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Returns
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Shipping Info')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Shipping Info
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Track Orders')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Track Orders
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('Contact Us')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleContactClick('email', 'support@greencart.com')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-left"
              >
                <Mail className="h-4 w-4" />
                <span>support@greencart.com</span>
              </button>
              <button
                onClick={() => handleContactClick('phone', '1-800-GREEN-CART')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-left"
              >
                <Phone className="h-4 w-4" />
                <span>1-800-GREEN-CART</span>
              </button>
              <button
                onClick={() => handleContactClick('location', 'San Francisco, CA')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-left"
              >
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 GreenCart. All rights reserved. Powered by EarthScore AI.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button 
              onClick={() => handleLinkClick('Privacy Policy')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => handleLinkClick('Terms of Service')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => handleLinkClick('Cookie Policy')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;