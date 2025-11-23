'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPassword } from '@/hooks/usePasswordReset';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/app/types/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormProps {
  token: string;
  email: string;
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate: resetPassword, isPending, error, isSuccess } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword(
      { token, newPassword: data.password },
      {
        onSuccess: () => {
          reset();
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push('/auth/login?reset=success');
          }, 2000);
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 w-full">
        <div className="rounded-lg bg-green-50 p-6 border border-green-200 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-semibold text-green-900">Password Reset Successful!</h3>
          <p className="text-sm text-green-800 mt-2">
            Your password has been updated. Redirecting to login...
          </p>
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-semibold inline-block mt-4"
          >
            Click here if not redirected
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Resetting password for: <span className="font-semibold">{email}</span>
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
          <Label htmlFor="password">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              {...register('password')}
              disabled={isPending}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              {...register('confirmPassword')}
              disabled={isPending}
              aria-invalid={!!errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/90">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
