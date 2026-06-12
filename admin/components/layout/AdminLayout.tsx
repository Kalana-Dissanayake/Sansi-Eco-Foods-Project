'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminTopbar from '../../components/layout/AdminTopbar';
import { Toaster } from 'react-hot-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  pendingOrders?: number;
}

export default function AdminLayout({
  children,
  title = 'Dashboard',
  pendingOrders = 0,
}: AdminLayoutProps) {
  const { isAuthenticated, loading, adminUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        pendingOrders={pendingOrders}
        userName={adminUser?.displayName ?? adminUser?.email}
      />
      <div className="lg:ml-64 pb-16 lg:pb-0">
        <AdminTopbar
          title={title}
          pendingOrders={pendingOrders}
          userName={adminUser?.displayName ?? adminUser?.email}
        />
        <main className="p-6">{children}</main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '8px', fontSize: '14px' },
          success: { iconTheme: { primary: '#15803d', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
