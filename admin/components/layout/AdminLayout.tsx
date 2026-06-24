'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminTopbar from '../../components/layout/AdminTopbar';
import { Toaster } from 'react-hot-toast';
import type { RolePermissions } from '../../../shared/types';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  pendingOrders?: number;
  requiredPermission?: keyof RolePermissions;
}

export default function AdminLayout({
  children,
  title = 'Dashboard',
  description,
  pendingOrders = 0,
  requiredPermission,
}: AdminLayoutProps) {
  const { isAuthenticated, loading, adminUser, hasPermission } = useAuth();
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

  const hasAccess = !requiredPermission || hasPermission(requiredPermission);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        pendingOrders={pendingOrders}
        userName={adminUser?.displayName ?? adminUser?.email}
      />
      <div className="lg:ml-64 pb-16 lg:pb-0">
        <AdminTopbar
          title={hasAccess ? title : 'Access Denied'}
          description={hasAccess ? description : undefined}
          pendingOrders={pendingOrders}
          userName={adminUser?.displayName ?? adminUser?.email}
        />
        <main className="p-6 page-fade-in">
          {hasAccess ? (
            children
          ) : (
            <div className="max-w-md mx-auto mt-16 bg-white border border-gray-100 shadow-sm rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto">
                🚫
              </div>
              <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
              <p className="text-sm text-gray-500">
                You do not have the required permissions to access this module. Please contact your administrator.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  🏠 Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </main>
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
