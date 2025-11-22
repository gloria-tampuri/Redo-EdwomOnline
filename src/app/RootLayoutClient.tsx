'use client';

import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { QueryProvider } from '@/app/QueryProvider';
import React from 'react';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </SessionProvider>
    </QueryProvider>
  );
}
