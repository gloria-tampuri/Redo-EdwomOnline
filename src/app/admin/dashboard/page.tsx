'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/admin-login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'admin') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name || 'Admin'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <p className="text-gray-600">Orders Today</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <p className="text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary mb-2">$0</div>
            <p className="text-gray-600">Today's Revenue</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/items"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
          >
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Items Management</h3>
            <p className="text-gray-600">Add, edit, or remove products</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
          >
            <div className="text-4xl mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Orders</h3>
            <p className="text-gray-600">Manage customer orders</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Users</h3>
            <p className="text-gray-600">View and manage customers</p>
          </Link>

          <Link
            href="/admin/packages"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
          >
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Packages</h3>
            <p className="text-gray-600">Manage meal packages</p>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">Configure your store</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 block"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">View sales reports</p>
          </Link>
        </div>

        {/* Coming Soon Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">🚀 Coming Soon</h3>
          <p className="text-blue-800">
            Full admin dashboard features are coming soon. Stay tuned for more management capabilities!
          </p>
        </div>
      </div>
    </main>
  );
}
