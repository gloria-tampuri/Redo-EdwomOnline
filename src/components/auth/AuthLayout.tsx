import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-white flex-col justify-between p-8">
        {/* Logo */}
        <div>
          <h1 className="text-3xl font-bold">🛒 Edwom Online</h1>
          <p className="text-primary-100 mt-2">Your Convenient Grocery Delivery Solution</p>
        </div>

        {/* Highlight Features */}
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="text-2xl">🚚</div>
            </div>
            <div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-primary-100 text-sm">Fresh groceries delivered to your doorstep</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="text-2xl">🛍️</div>
            </div>
            <div>
              <h3 className="font-semibold">Wide Selection</h3>
              <p className="text-primary-100 text-sm">Browse thousands of products and packages</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="text-2xl">👨‍🍳</div>
            </div>
            <div>
              <h3 className="font-semibold">Meal Packages</h3>
              <p className="text-primary-100 text-sm">Pre-curated ingredients with cooking guides</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="text-2xl">✨</div>
            </div>
            <div>
              <h3 className="font-semibold">Quality Guaranteed</h3>
              <p className="text-primary-100 text-sm">Fresh products and exceptional service</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-primary-100 text-sm">
          <p>© 2025 Edwom Online. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-gray-50">
        {/* Mobile Logo */}
        <div className="md:hidden mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">🛒 Edwom Online</h1>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md">
          {children}
        </div>

        {/* Mobile Footer */}
        <div className="md:hidden mt-8 text-center text-xs text-gray-500">
          <p>© 2025 Edwom Online. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
