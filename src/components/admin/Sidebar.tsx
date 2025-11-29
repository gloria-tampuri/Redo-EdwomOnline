'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { ADMIN_NAV_ITEMS } from '@/constants/adminNav';
import { Settings, Menu } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';


export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 sticky top-0 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo + Menu Icon */}
      <div className={`p-4 border-b border-gray-200 relative z-10 ${collapsed ? 'flex flex-col items-center justify-center gap-2' : 'flex items-center justify-between'}`}
        style={collapsed ? { minHeight: '80px' } : {}}>
        {collapsed ? (
          <>
            <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
              <Logo href="/" size="sm" />
            </div>
            <button
              aria-label="Expand sidebar"
              onClick={() => setCollapsed(false)}
              className="p-2 rounded hover:bg-gray-200 transition"
            >
              <Menu className="h-6 w-6" />
            </button>
          </>
        ) : (
          <>
            <Logo href="/" size="md" />
            <button
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              className="ml-2 p-2 rounded hover:bg-gray-100 transition"
            >
              <Menu className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <TooltipProvider>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 py-3 mx-2 mb-4 rounded-lg transition-colors ${
                      active
                        ? 'bg-[#556B2F33] text-[#556B2F] font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {!collapsed && (
                      <span className={`text-sm font-medium${active ? ' font-semibold' : ''}`}>{item.label}</span>
                    )}
                    {item.badge && item.badge > 0 && !collapsed && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-gray-900 text-white px-2 py-1 rounded shadow">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-gray-200 p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/admin/settings"
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 py-3 rounded-lg transition-colors text-sm font-medium ${
                  isActive('/admin/settings')
                    ? 'bg-[#556B2F33] text-[#556B2F] font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings size={20} />
                {!collapsed && <span>Settings</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-gray-900 text-white px-2 py-1 rounded shadow">
                Settings
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
