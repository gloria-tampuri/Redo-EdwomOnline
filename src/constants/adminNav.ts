import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Folders,
  Grid3x3,
  Zap,
  Percent,
  BarChart3,
  Users,
  Settings,
  LucideIcon,
  Gift,
  Tag,
  Archive,
  Megaphone,
  Activity,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[];
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: 0,
  },
  {
    label: 'Items',
    href: '/admin/items',
    icon: Package,
  },
  {
    label: 'Categories & Units',
    href: '/admin/categories',
    icon: Folders,
  },
  {
    label: 'Packages',
    href: '/admin/packages',
    icon: Gift,
  },
  {
    label: 'Seasonal & Pricing',
    href: '/admin/pricing',
    icon: Tag,
  },
  {
    label: 'Inventory',
    href: '/admin/inventory',
    icon: Archive,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Promotions',
    href: '/admin/promotions',
    icon: Megaphone,
  },
  {
    label: 'Reports & Analytics',
    href: '/admin/analytics',
    icon: Activity,
  },
//   {
//     label: 'Settings',
//     href: '/admin/settings',
//     icon: Settings,
//   },
];
