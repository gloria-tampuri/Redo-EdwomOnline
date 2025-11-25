'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useEffect } from 'react';

export default function ForgotPasswordPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push('/');
    }
  }, [session, router]);

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="We'll help you regain access to your account"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
