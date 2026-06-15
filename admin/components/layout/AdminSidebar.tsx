'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { RolePermissions } from '../../../shared/types';

interface AdminSidebarProps {
  pendingOrders?: number;
  userName?: string;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', permission: 'dashboard_view' },
  { href: '/orders', label: 'Orders', icon: '📦', badge: true, permission: 'orders_view' },
  { href: '/orders/delivery', label: 'Delivery Queue', icon: '🛵', permission: 'orders_delivery_queue' },
  { href: '/products', label: 'Products', icon: '🛍️', permission: 'menu_view' },
  { href: '/customers', label: 'Customers', icon: '👥', permission: 'customers_view' },
  { href: '/staff', label: 'Staff & Roles', icon: '🔑', permission: 'staff_manage' },
  { href: '/settings', label: 'Settings', icon: '⚙️', permission: 'settings_manage' },
];

export default function AdminSidebar({ pendingOrders = 0, userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    hasPermission(item.permission as keyof RolePermissions)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <img
            src="/images/sansi-logo.png"
            alt="Sansi Eco Foods Logo"
            className="w-10 h-10 object-contain"
          />
          <div>
            <div className="font-extrabold text-sm leading-tight tracking-wider" style={{ fontFamily: 'var(--font-open-sans), sans-serif' }}>
              <span style={{ color: '#ff6a00' }}>SANSI</span>{' '}
              <span style={{ color: '#00d26a' }}>ECO</span>{' '}
              <span style={{
                background: 'linear-gradient(to right, #ff6a00, #00d26a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>FOODS</span>
            </div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {visibleNavItems.map(({ href, label, icon, badge }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-base">{icon}</span>
                <span className="flex-1">{label}</span>
                {badge && pendingOrders > 0 && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-100 px-4 py-4">
          {userName && (
            <div className="text-xs text-gray-400 mb-3 truncate">
              Signed in as: <span className="text-gray-600 font-medium">{userName}</span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
        {visibleNavItems.map(({ href, label, icon, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-xs relative ${
                active ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-0.5">{icon}</span>
              <span className="leading-tight">{label}</span>
              {badge && pendingOrders > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingOrders > 9 ? '9+' : pendingOrders}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
