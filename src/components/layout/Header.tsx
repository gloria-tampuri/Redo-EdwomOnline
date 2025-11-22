import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/assets/EdwomLogo.png" alt="Edwom Online" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
            Shop
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
            Packages
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
            About
          </Link>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-1 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
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
                className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
            >
              Shop
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
            >
              Packages
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
            >
              About
            </Link>

            {isAuthenticated && user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
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
                  className="block px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
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
