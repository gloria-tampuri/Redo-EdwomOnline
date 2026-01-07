'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <Logo href="/" />
            <p className="mt-4 text-sm text-gray-400">
              Fresh groceries delivered to your doorstep, every day.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#00CC4D] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Fresh Produce
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Meat & Fish
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Beverages
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#00CC4D] transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#00CC4D] mt-1 flex-shrink-0" />
                <span>+233 (0) 123 456 789</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#00CC4D] mt-1 flex-shrink-0" />
                <span>support@edwom.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#00CC4D] mt-1 flex-shrink-0" />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Edwom Online. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-[#00CC4D] transition"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-[#00CC4D] transition"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-[#00CC4D] transition"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex gap-4 text-sm">
            <Link href="#" className="text-gray-400 hover:text-[#00CC4D] transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-[#00CC4D] transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
