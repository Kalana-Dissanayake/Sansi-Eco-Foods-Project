'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/dashboard/StatCard';
import RecentOrders from '../../components/dashboard/RecentOrders';
import { useAuth } from '../../hooks/useAuth';
import {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
  seedInitialData,
} from '../../lib/firestore';
import type { Order, Product } from '../../../shared/types';

export default function DashboardPage() {
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState({ ordersToday: 0, ordersThisMonth: 0, revenueThisMonth: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Seed initial data on first login
      try { await seedInitialData(); } catch { /* Already seeded */ }

      const [s, orders, lowStock] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(10),
        getLowStockProducts(),
      ]);
      setStats(s);
      setRecentOrders(orders);
      setLowStockProducts(lowStock);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AdminLayout title="Dashboard" pendingOrders={stats.pendingOrders} requiredPermission="dashboard_view">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-sans">
            <StatCard
              label="Orders Today"
              value={stats.ordersToday}
              icon="📋"
              color="blue"
            />
            <StatCard
              label="Orders This Month"
              value={stats.ordersThisMonth}
              icon="📦"
              color="purple"
            />
            {hasPermission('dashboard_export_analytics') && (
              <StatCard
                label="Revenue This Month"
                value={`Rs. ${stats.revenueThisMonth.toLocaleString()}`}
                icon="💰"
                color="green"
              />
            )}
            <StatCard
              label="Pending Orders"
              value={stats.pendingOrders}
              icon="⏳"
              color="yellow"
            />
          </div>

          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h2 className="font-bold text-orange-800">Low Stock Alerts</h2>
                <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {lowStockProducts.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {lowStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center gap-2 bg-white border border-orange-200 rounded-lg px-3 py-2 hover:border-orange-400 transition-colors"
                  >
                    <span className="font-semibold text-sm text-gray-700">{p.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stockQuantity === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {p.stockQuantity === 0 ? 'Out of Stock' : `${p.stockQuantity} left`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Recent Orders</h2>
                <Link href="/orders" className="text-sm text-green-700 hover:underline font-medium">
                  View All →
                </Link>
              </div>
              <RecentOrders orders={recentOrders} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { href: '/orders?status=Pending', label: 'View Pending Orders', icon: '⏳', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
                  { href: '/products/new', label: 'Add New Product', icon: '➕', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                  { href: '/orders', label: 'All Orders', icon: '📦', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { href: '/customers', label: 'Customer List', icon: '👥', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                  { href: '/settings', label: 'Site Settings', icon: '⚙️', color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
                ].map(({ href, label, icon, color }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${color} transition-colors text-sm font-medium`}
                  >
                    <span>{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
