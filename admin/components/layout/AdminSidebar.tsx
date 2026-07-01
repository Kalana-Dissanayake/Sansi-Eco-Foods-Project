'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { RolePermissions } from '../../../shared/types';

interface AdminSidebarProps {
  pendingOrders?: number;
  userName?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission: keyof RolePermissions;
  badgeType?: 'orders' | 'notifications';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊', permission: 'dashboard_view' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { href: '/orders', label: 'Orders', icon: '📦', permission: 'orders_view', badgeType: 'orders' },
      { href: '/products', label: 'Products', icon: '🛍️', permission: 'menu_view' },
      { href: '/categories', label: 'Categories', icon: '🏷️', permission: 'menu_view' },
      { href: '/customers', label: 'Customers', icon: '👥', permission: 'customers_view' },
      { href: '/staff', label: 'Staff & Roles', icon: '🔑', permission: 'staff_manage' },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { href: '/reports', label: 'Reports', icon: '📈', permission: 'reports_view' },
      { href: '/notifications', label: 'Notifications', icon: '🔔', permission: 'messages_view', badgeType: 'notifications' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/export', label: 'Export Data', icon: '📥', permission: 'export_view' },
      { href: '/settings', label: 'Settings', icon: '⚙️', permission: 'settings_manage' },
    ],
  },
];

export default function AdminSidebar({ pendingOrders = 0, userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, adminUser } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    // Only subscribe if user has permissions
    if (!hasPermission('messages_view')) return;
    const q = query(collection(db, 'notifications'), where('read', '==', false));
    const unsubscribe = onSnapshot(
      q,
      (snap) => setUnreadMessages(snap.size),
      (err) => console.log('Notifications count listener suppressed:', err.message)
    );
    return unsubscribe;
  }, [hasPermission]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const getBadgeValue = (type?: 'orders' | 'notifications') => {
    if (type === 'orders') return pendingOrders;
    if (type === 'notifications') return unreadMessages;
    return 0;
  };

  const isActive = (itemHref: string) => {
    if (pathname === itemHref) return true;
    if (itemHref === '/orders') {
      return pathname.startsWith('/orders/');
    }
    if (itemHref === '/categories') {
      return pathname.startsWith('/categories');
    }
    if (itemHref !== '/dashboard') {
      return pathname.startsWith(itemHref + '/');
    }
    return false;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 h-screen w-64 bg-[#100e2b] text-slate-300 z-30 shadow-xl font-sans">
        {/* Logo / Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <img
            src="/images/sansi-logo.png"
            alt="Sansi Eco Foods Logo"
            className="w-10 h-10 object-contain"
          />
          <div>
            <div className="font-extrabold text-sm text-white leading-tight tracking-wider" style={{ fontFamily: 'var(--font-open-sans), sans-serif' }}>
              <span style={{ color: '#ff6a00' }}>SANSI</span>{' '}
              <span style={{ color: '#00d26a' }}>ECO</span>{' '}
              <span style={{
                background: 'linear-gradient(to right, #ff6a00, #00d26a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>FOODS</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Admin Panel</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          {SECTIONS.map((section) => {
            // Filter section items by permission
            const visibleItems = section.items.filter((item) =>
              hasPermission(item.permission)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1.5">
                <div className="text-[10px] font-extrabold text-slate-500 tracking-widest px-3">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    const badge = getBadgeValue(item.badgeType);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                          active
                            ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/10'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.badgeType === 'notifications'
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-amber-400 text-yellow-900'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-white/5 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-inner">
              {adminUser?.displayName ? adminUser.displayName[0]?.toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {adminUser?.displayName ?? 'Staff User'}
              </div>
              <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                {adminUser?.email ?? 'staff@sansiecofoods.com'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all duration-200"
            title="Sign Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#100e2b] border-t border-white/5 z-40 flex shadow-lg">
        {SECTIONS.flatMap((s) => s.items)
          .filter((item) => hasPermission(item.permission))
          .slice(0, 4) // Show first 4 visible navigation tabs
          .map((item) => {
            const active = isActive(item.href);
            const badge = getBadgeValue(item.badgeType);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold relative transition-colors ${
                  active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-lg mb-0.5">{item.icon}</span>
                <span className="leading-tight">{item.label.split(' ')[0]}</span>
                {badge > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-4 h-4 bg-amber-500 text-slate-900 text-[9px] font-black rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        {/* Toggle Button for More/Menu */}
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-semibold relative transition-colors ${
            isMobileDrawerOpen ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Toggle navigation drawer"
        >
          <span className="text-lg mb-0.5">⚙️</span>
          <span className="leading-tight">More</span>
        </button>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ease-in-out"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Slide-Out Drawer Menu */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-16 w-64 bg-[#100e2b] text-slate-300 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-white/5 font-sans ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <img
            src="/images/sansi-logo.png"
            alt="Sansi Eco Foods Logo"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="font-extrabold text-xs text-white leading-tight tracking-wider" style={{ fontFamily: 'var(--font-open-sans), sans-serif' }}>
              <span style={{ color: '#ff6a00' }}>SANSI</span>{' '}
              <span style={{ color: '#00d26a' }}>ECO</span>{' '}
              <span style={{
                background: 'linear-gradient(to right, #ff6a00, #00d26a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>FOODS</span>
            </div>
            <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">Admin Panel</span>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-5">
          {SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) =>
              hasPermission(item.permission)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="text-[9px] font-extrabold text-slate-500 tracking-widest px-2.5">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    const badge = getBadgeValue(item.badgeType);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                          active
                            ? 'bg-indigo-600/90 text-white shadow-md'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            item.badgeType === 'notifications'
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-amber-400 text-yellow-900'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Drawer User profile & Log Out */}
        <div className="border-t border-white/5 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-inner">
              {adminUser?.displayName ? adminUser.displayName[0]?.toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {adminUser?.displayName ?? 'Staff User'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsMobileDrawerOpen(false);
              handleSignOut();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-semibold shadow-sm transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
