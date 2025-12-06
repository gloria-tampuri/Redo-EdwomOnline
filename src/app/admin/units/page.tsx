'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import UnitsTable from '@/components/admin/UnitsTable';

export default function UnitsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-600">Loading...</div>
      </AdminLayout>
    );
  }

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Units Management</h1>
          <p className="text-gray-600 mt-1">Manage measurement units for your products</p>
        </div>

        <UnitsTable />
      </div>
    </AdminLayout>
  );
}
