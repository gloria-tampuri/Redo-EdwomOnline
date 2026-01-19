"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "../ui/logo";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className=" text-[#12170AB2]">
      <div className="w-full px-4 sm:px-6 lg:px-12 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-8 justify-items-start lg:justify-items-center">
          {/* Brand Column */}
          <div className="max-w-xs">
            <Logo href="/" />
            <p className="mt-4 text-sm text-[#12170AB2] ">
              Edwom Online brings fresh groceries to your doorstep with
              convenience, quality, and care. Shop smarter, eat fresher{" "}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-black mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Fresh Produce
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Meat & Fish
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Dairy & Eggs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Beverages
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-black mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/auth/admin-login">Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-black mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone size={16} className=" mt-1 flex-shrink-0" />
                <span>+233 (0) 123 456 789</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className=" mt-1 flex-shrink-0" />
                <span>support@edwom.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className=" mt-1 flex-shrink-0" />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#12170A1] my-8" />

        {/* Bottom Footer */}
        <div className="grid place-content-center">
          <div className="bg-[#12170AB2] py-6 px-20 rounded-sm m-8">
            <h2 className="text-center text-white py-3 text-2xl mb-3 ">
              Join our news letter
            </h2>
            <div className="flex">
              <Input
                placeholder="Enter your email"
                className="bg-transparent border-white"
              />
              <Button className="bg-white ml-2 text-black">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
