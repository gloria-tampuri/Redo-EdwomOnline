'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { ADMIN_NAV_ITEMS } from '@/constants/adminNav';
import { Settings } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="w-48 bg-white border-r border-gray-200 h-screen overflow-y-auto sticky top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 flex items-center justify-center">
        <Logo href="/" size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-gray-200 p-4">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            isActive('/admin/settings')
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings/>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
