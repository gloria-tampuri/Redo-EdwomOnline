'use client';

import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { QueryProvider } from '@/app/QueryProvider';
import { usePathname } from 'next/navigation';
import React from 'react';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide header on auth and admin routes
  const hideHeader = pathname.startsWith('/auth') || pathname.startsWith('/admin');

  return (
    <QueryProvider>
      <SessionProvider>
        <div className="flex flex-col min-h-screen">
          {!hideHeader && <Header />}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </SessionProvider>
    </QueryProvider>
  );
}
