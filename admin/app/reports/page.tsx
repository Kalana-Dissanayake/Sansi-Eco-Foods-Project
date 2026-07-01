'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from '../../components/layout/AdminLayout';
import type { Order } from '../../../shared/types';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',     // Amber
  Confirmed: '#3b82f6',   // Blue
  Processing: '#06b6d4',  // Cyan
  Dispatched: '#8b5cf6',  // Purple
  Delivered: '#10b981',   // Green
  Cancelled: '#ef4444',   // Red
};

const DEFAULT_COLOR = '#64748b'; // Slate

interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  name: string;
  value: number;
}

interface StatusDistribution {
  name: string;
  value: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [aov, setAov] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Charts data
  const [salesTrends, setSalesTrends] = useState<SalesDataPoint[]>([]);
  const [productData, setProductData] = useState<ProductPerformance[]>([]);
  const [statusData, setStatusData] = useState<StatusDistribution[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const orders: Order[] = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Order)
        );

        // Filter and calculate totals
        const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');
        const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totalLKR ?? 0), 0);
        setTotalRevenue(revenue);
        setTotalOrders(orders.length);
        setAov(deliveredOrders.length > 0 ? Math.round(revenue / deliveredOrders.length) : 0);
        setPendingCount(orders.filter((o) => o.orderStatus === 'Pending').length);

        // 1. Calculate Sales Trends (last 7 days)
        const trendsMap: Record<string, { revenue: number; orders: number }> = {};
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          trendsMap[dateStr] = { revenue: 0, orders: 0 };
        }

        orders.forEach((order) => {
          const orderDate = typeof order.createdAt?.toDate === 'function' ? order.createdAt.toDate() : new Date(order.createdAt as any);
          const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (trendsMap[dateStr] !== undefined) {
            trendsMap[dateStr].orders += 1;
            if (order.orderStatus === 'Delivered') {
              trendsMap[dateStr].revenue += order.totalLKR;
            }
          }
        });

        const salesTrendsData = Object.entries(trendsMap).map(([date, val]) => ({
          date,
          revenue: val.revenue,
          orders: val.orders,
        }));
        setSalesTrends(salesTrendsData);

        // 2. Product Performance (Popular items)
        const productMap: Record<string, number> = {};
        orders.forEach((order) => {
          if (order.orderStatus === 'Cancelled') return;
          order.items.forEach((item) => {
            productMap[item.productName] = (productMap[item.productName] || 0) + item.quantity;
          });
        });

        const productPerfData = Object.entries(productMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // Top 5
        setProductData(productPerfData);

        // 3. Status Distribution
        const statusMap: Record<string, number> = {};
        orders.forEach((order) => {
          statusMap[order.orderStatus] = (statusMap[order.orderStatus] || 0) + 1;
        });

        const statusDistData = Object.entries(statusMap).map(([name, value]) => ({
          name,
          value,
        }));
        setStatusData(statusDistData);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (!mounted) {
    return (
      <AdminLayout title="Reports & Charts" description="Analyse order trends, revenue performance, and best-selling products." requiredPermission="reports_view">
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Reports & Charts" description="Analyse order trends, revenue performance, and best-selling products." requiredPermission="reports_view">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Sales Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, desc: 'From delivered orders', color: 'bg-indigo-600', icon: '💰' },
              { label: 'AOV (Average Order)', value: `Rs. ${aov.toLocaleString()}`, desc: 'Average cart value', color: 'bg-emerald-600', icon: '🛒' },
              { label: 'Total Orders Placed', value: totalOrders, desc: 'All lifetime orders', color: 'bg-blue-600', icon: '📦' },
              { label: 'Active Pending Orders', value: pendingCount, desc: 'Needs confirmation', color: 'bg-amber-600', icon: '⏳' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">{card.label}</span>
                  <div className="text-2xl font-black text-slate-800 leading-tight">{card.value}</div>
                  <span className="text-[10px] text-slate-400 block font-medium">{card.desc}</span>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center text-lg shadow-md`}>
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trends Area Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Revenue Sales Trend</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Daily sales performance over the past week</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (Rs.)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Distribution Pie Chart */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3 flex flex-col">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Order Status Distribution</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Breakdown of all orders by current status</span>
              </div>

              {statusData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-10">No order data yet</div>
              ) : (
                <>
                  <div className="h-52 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={42}
                          paddingAngle={2}
                          dataKey="value"
                          labelLine={false}
                          label={(props) => {
                            const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
                            if (percent < 0.06) return null;
                            const RADIAN = Math.PI / 180;
                            const radius = (innerRadius as number) + ((outerRadius as number) - (innerRadius as number)) * 0.55;
                            const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
                            const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
                            return (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800}>
                                {`${((percent as number) * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || DEFAULT_COLOR} stroke="white" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          formatter={(value: any, name: any) => [`${value} orders`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centre total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-800 leading-none">
                        {statusData.reduce((s, d) => s + d.value, 0)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">Total</span>
                    </div>
                  </div>

                  {/* Rich legend */}
                  <div className="space-y-1.5 pt-1">
                    {statusData
                      .sort((a, b) => b.value - a.value)
                      .map((item) => {
                        const total = statusData.reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                        const color = STATUS_COLORS[item.name] || DEFAULT_COLOR;
                        return (
                          <div key={item.name} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                              <span className="font-semibold text-slate-600">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-800">{item.value}</span>
                              <span className="text-slate-400 w-9 text-right">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>

            {/* Product Performance Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Top Selling Products</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Top 5 items ordered by quantity sold</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={35} name="Quantity Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Volume Bar Chart */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Daily Orders Volume</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Quantity of orders placed over the past week</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={25} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
