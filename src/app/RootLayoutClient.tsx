'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QueryProvider } from '@/app/QueryProvider';
import { CartProvider } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import React from 'react';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header and footer on auth and admin routes
  const hideHeaderFooter = pathname.startsWith('/auth') || pathname.startsWith('/admin');

  return (
    <QueryProvider>
      <SessionProvider>
        <CartProvider>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            duration={4000}
          />
          <div className="flex flex-col min-h-screen">
            {!hideHeaderFooter && <Header />}
            <main className="flex-1">
              {children}
            </main>
            {!hideHeaderFooter && <Footer />}
          </div>
        </CartProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
