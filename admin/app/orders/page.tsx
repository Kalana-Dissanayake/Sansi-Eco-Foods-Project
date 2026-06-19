'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { getOrders, deleteOrder } from '../../lib/firestore';
import { useAuth } from '../../hooks/useAuth';
import type { Order, OrderStatus } from '../../../shared/types';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const STATUS_TABS: { label: string; value?: OrderStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Dispatched', value: 'Dispatched' },
  { label: 'Delivered', value: 'Delivered' },
  { label: 'Cancelled', value: 'Cancelled' },
];

function formatDate(ts: { toDate(): Date } | null): string {
  if (!ts) return '-';
  return new Intl.DateTimeFormat('en-LK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(ts.toDate());
}

export default function OrdersPage() {
  const { hasPermission } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState<{ id: string; orderNumber: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getOrders(activeStatus);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [activeStatus]);

  const handleDeleteTrigger = (id: string, orderNumber: string) => {
    setDeleteOrderTarget({ id, orderNumber });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteOrderTarget) return;
    setIsDeleteOpen(false);
    try {
      await deleteOrder(deleteOrderTarget.id);
      toast.success('Order deleted');
      setDeleteOrderTarget(null);
      load();
    } catch {
      toast.error('Failed to delete order');
    }
  };

  const filteredOrders = searchQuery
    ? orders.filter((o) =>
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery)
      )
    : orders;

  const pendingCount = orders.filter((o) => o.orderStatus === 'Pending').length;

  return (
    <AdminLayout title="Orders" pendingOrders={pendingCount} requiredPermission="orders_view">
      <div className="space-y-4 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order # or customer..."
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-72"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveStatus(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeStatus === tab.value
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📭</div>
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-700">{order.customer.name}</div>
                        <div className="text-xs text-gray-400">{order.customer.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 font-bold text-green-700 whitespace-nowrap">Rs. {order.totalLKR.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">{order.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.orderStatus} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(order.createdAt as { toDate(): Date })}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            View
                          </Link>
                          {hasPermission('orders_refund') && (
                            <button
                              onClick={() => handleDeleteTrigger(order.id, order.orderNumber)}
                              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Order"
        message={`Are you sure you want to delete order "${deleteOrderTarget?.orderNumber}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteOrderTarget(null);
        }}
      />
    </AdminLayout>
  );
}
