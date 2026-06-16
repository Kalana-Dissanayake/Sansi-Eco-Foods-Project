'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
  seedInitialData,
} from '../../lib/firestore';
import type { Order, Product } from '../../../shared/types';

interface DashboardStats {
  ordersToday: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  pendingOrders: number;
  unreadMessages: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
}

interface MessageItem {
  id: string;
  name: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: any;
}

function formatDate(ts: any): string {
  if (!ts) return '';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    ordersThisMonth: 0,
    revenueThisMonth: 0,
    pendingOrders: 0,
    unreadMessages: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentMessages, setRecentMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Seed initial data on first login
      try { await seedInitialData(); } catch { /* Already seeded */ }

      try {
        const [s, orders, lowStock, customersSnap, productsSnap, couponsSnap, unreadMsgSnap, recentMsgSnap] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(5),
          getLowStockProducts(),
          getDocs(collection(db, 'customers')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'coupons')),
          getDocs(query(collection(db, 'contact_messages'), where('read', '==', false))),
          getDocs(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'), limit(5))),
        ]);

        setStats({
          ordersToday: s.ordersToday,
          ordersThisMonth: s.ordersThisMonth,
          revenueThisMonth: s.revenueThisMonth,
          pendingOrders: s.pendingOrders,
          unreadMessages: unreadMsgSnap.size,
          totalProducts: productsSnap.size,
          totalCustomers: customersSnap.size,
          lowStockCount: lowStock.length,
        });

        setRecentOrders(orders);
        setRecentMessages(
          recentMsgSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MessageItem))
        );
      } catch (err) {
        console.error('Error loading dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <AdminLayout title="Dashboard" pendingOrders={stats.pendingOrders} requiredPermission="dashboard_view">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          {/* 8 KPIs Grid matching image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Orders Today */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-semibold">
                  📋
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800 leading-tight">{stats.ordersToday}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">ORDERS TODAY</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-500" />
            </div>

            {/* 2. Orders Month */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  📄
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800 leading-tight">{stats.ordersThisMonth}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">TOTAL ORDERS</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500" />
            </div>

            {/* 3. Revenue Month */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-semibold">
                  💰
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl font-black text-slate-800 leading-tight">Rs. {stats.revenueThisMonth.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">TOTAL REVENUE</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500" />
            </div>

            {/* 4. Messages */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-semibold">
                  ✉️
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800 leading-tight">{stats.unreadMessages}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">UNREAD MESSAGES</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-500" />
            </div>

            {/* 5. Pending */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-semibold">
                  ⏳
                </div>
                <span className="bg-amber-50 text-amber-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-amber-100">Pending</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800 leading-tight">{stats.pendingOrders}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">PENDING ORDERS</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500" />
            </div>

            {/* 6. Low Stock */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm font-semibold">
                  ⚠️
                </div>
                <span className="bg-red-50 text-red-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-red-100">Alert</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800 leading-tight">{stats.lowStockCount}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">LOW STOCK PRODUCTS</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-500" />
            </div>

            {/* 7. Total Products */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-semibold">
                  🛍️
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-emerald-100">Active</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800 leading-tight">{stats.totalProducts}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">TOTAL PRODUCTS</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500" />
            </div>

            {/* 8. Total Customers */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 relative flex flex-col justify-between min-h-[120px] overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  👥
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-800 leading-tight">{stats.totalCustomers}</div>
                <div className="text-[10px] text-slate-400 font-extrabold tracking-wider mt-1 uppercase">TOTAL CUSTOMERS</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500" />
            </div>
          </div>

          {/* Lower Grid: Recent Orders and Recent Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">📋</span>
                  <h3 className="font-bold text-slate-800 text-sm">Recent Orders</h3>
                </div>
                <Link href="/orders" className="text-xs font-bold text-indigo-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-50 flex-1">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center shadow-inner">
                        {getInitials(order.customer.name)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{order.orderNumber}</div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{order.customer.name}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">No orders yet</div>
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">💬</span>
                  <h3 className="font-bold text-slate-800 text-sm">Recent messages</h3>
                </div>
                <Link href="/messages" className="text-xs font-bold text-indigo-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-50 flex-1">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center shadow-inner flex-shrink-0">
                        {getInitials(msg.name)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-800 text-xs truncate">{msg.name}</div>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5 block">{msg.subject}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold ml-2 flex-shrink-0">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                ))}
                {recentMessages.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">No messages yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
