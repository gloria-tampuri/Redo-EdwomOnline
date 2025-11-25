'use client';

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useVerifyResetToken } from '@/hooks/usePasswordReset';
import { useEffect, Suspense } from 'react';

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { data: session } = useSession();
  const router = useRouter();

  const { data: verificationData, isLoading, error } = useVerifyResetToken(token);

  useEffect(() => {
    if (session?.user) {
      router.push('/');
    }
  }, [session, router]);

  if (!token) {
    return (
      <AuthLayout title="Invalid Reset Link" subtitle="No reset token provided">
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">❌ This password reset link is invalid.</p>
          </div>
          <a
            href="/auth/forgot-password"
            className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
          >
            Request a new reset link
          </a>
        </div>
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout title="Verifying Reset Link" subtitle="Please wait...">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </AuthLayout>
    );
  }

  if (error || !verificationData?.email) {
    return (
      <AuthLayout title="Reset Link Expired" subtitle="Try requesting a new one">
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm text-red-800">
              ❌ {(error as any)?.response?.data?.error || 'This reset link has expired or is invalid.'}
            </p>
          </div>
          <a
            href="/auth/forgot-password"
            className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
          >
            Request a new reset link
          </a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a new password for your account"
    >
      <ResetPasswordForm token={token} email={verificationData.email} />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
