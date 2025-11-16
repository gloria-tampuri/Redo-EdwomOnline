'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to home if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
