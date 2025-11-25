import React from "react";
import { Logo } from "@/components/ui/logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Background Image (Hidden on mobile) */}

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-gray-50">
        {/* Mobile Logo */}
        <div className="md:hidden mb-8 text-center">
          <Logo href="/" size="md" />
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md">{children}</div>

        {/* Mobile Footer */}
        <div className="md:hidden mt-8 text-center text-xs text-gray-500">
          <p>© 2025 Edwom Online. All rights reserved.</p>
        </div>
      </div>
      {/* Right Side - Form */}

      <div
        className="hidden md:flex md:w-1/2 text-white flex-col justify-between p-8 relative overflow-hidden"
        style={{
          backgroundImage: "url(/assets/authImg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay with 50% opacity */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Placeholder for future content */}
        </div>
      </div>
    </div>
  );
}
