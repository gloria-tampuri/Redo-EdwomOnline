import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute component that wraps pages requiring authentication
 * Redirects to login if not authenticated
 * Redirects to home if requireAdmin=true and user is not admin
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;

    // Not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/auth/login?callbackUrl=${pathname}`);
      return;
    }

    // Authenticated but not admin and admin is required
    if (requireAdmin && !isAdmin) {
      router.push('/');
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname, requireAdmin]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Not authenticated or (admin required but not admin)
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
