'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '@/hooks/usePasswordReset';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/app/types/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        setSubmitSuccess(true);
        reset();
      },
    });
  };

  // Success state - show confirmation message
  if (submitSuccess) {
    return (
      <div className="space-y-6 w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-card-foreground">Verify email</h2>
          <p className="mt-4 text-gray-600">
            We've sent a link to reset your password. If it doesn't arrive soon, check your spam folder.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-center text-card-foreground">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">
            ❌ {(error as any)?.response?.data?.error || error.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>

          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            disabled={isPending}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/90">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
