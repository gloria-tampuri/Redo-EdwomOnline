import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { Logo } from '../ui/logo';
import { ShoppingCart } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { state: cartState } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Logo href="/" />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Shop
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition font-medium">
            Packages
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition font-medium">
            About
          </Link>

          {/* Cart Icon */}
          <Link
            href="/checkout"
            className="relative p-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ShoppingCart size={24} />
            {cartState.totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#556B2F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartState.totalItems}
              </span>
            )}
          </Link>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-1 rounded-lg bg-[#556B2F] text-white text-sm font-medium hover:bg-[#4a5c2a] transition"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#556B2F] text-white flex items-center justify-center font-bold">
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900 transition text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 transition font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-lg bg-[#556B2F] text-white font-medium hover:bg-[#4a5c2a] transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button & Cart */}
        <div className="md:hidden flex items-center gap-4">
          <Link
            href="/checkout"
            className="relative p-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ShoppingCart size={20} />
            {cartState.totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#556B2F] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                {cartState.totalItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-900 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition font-medium"
            >
              Shop
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition font-medium"
            >
              Packages
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition font-medium"
            >
              About
            </Link>

            {isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-2 rounded-lg bg-[#556B2F] text-white font-medium hover:bg-[#4a5c2a] transition"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 rounded-lg bg-[#556B2F] text-white font-medium hover:bg-[#4a5c2a] transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
