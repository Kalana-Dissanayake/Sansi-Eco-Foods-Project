'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import OrderStatusBadge from '../../../components/orders/OrderStatusBadge';
import { getOrderById, updateOrderStatus } from '../../../lib/firestore';
import { useAuth } from '../../../hooks/useAuth';
import type { Order, OrderStatus } from '../../../../shared/types';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'
];

function formatDate(ts: { toDate(): Date } | null): string {
  if (!ts) return '-';
  return new Intl.DateTimeFormat('en-LK', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(ts.toDate());
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.orderId) {
      getOrderById(params.orderId).then((o) => {
        if (o) {
          setOrder(o);
          setNewStatus(o.orderStatus);
        }
        setLoading(false);
      });
    }
  }, [params.orderId]);

  const handleUpdateStatus = async () => {
    if (!order || !user) return;
    if (newStatus === order.orderStatus) {
      toast.error('Status is the same. No change needed.');
      return;
    }

    if (newStatus === 'Cancelled' && !hasPermission('orders_refund')) {
      toast.error('You do not have permission to cancel orders or process refunds.');
      return;
    }

    setUpdating(true);
    try {
      await updateOrderStatus(
        order.id,
        newStatus,
        user.uid,
        statusNote,
        newStatus === 'Cancelled' ? cancellationReason : undefined
      );
      toast.success(`Order status updated to ${newStatus}`);
      // Refresh
      const updated = await getOrderById(order.id);
      if (updated) setOrder(updated);
      setStatusNote('');
    } catch (err) {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <AdminLayout title="Order Detail">
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Not Found">
        <div className="text-center py-16">
          <p className="text-gray-500">Order not found.</p>
          <Link href="/orders" className="text-green-700 hover:underline mt-3 block">← Back to Orders</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Order ${order.orderNumber}`}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-sans">
        <Link href="/orders" className="hover:text-gray-700">Orders</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{order.orderNumber}</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
        {/* Left: Customer + Items */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{order.orderNumber}</h2>
                <p className="text-sm text-gray-400 mt-1">Placed: {formatDate(order.createdAt as { toDate(): Date })}</p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.orderStatus} />
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg font-medium transition-colors"
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    {item.productImage && (
                      <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: 'cover' }} sizes="48px" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{item.productName}</div>
                    <div className="text-sm text-gray-400">× {item.quantity} @ Rs. {item.priceLKR.toLocaleString()}</div>
                  </div>
                  <div className="font-bold text-gray-800">Rs. {item.subtotalLKR.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>Rs. {order.subtotalLKR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span><span>{order.shippingLKR === 0 ? 'FREE' : `Rs. ${order.shippingLKR.toLocaleString()}`}</span>
              </div>
              {order.discountLKR > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({order.couponCode})</span><span>−Rs. {order.discountLKR.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-green-700">Rs. {order.totalLKR.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Name</div>
                <div className="font-medium">{order.customer.name}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Phone</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{order.customer.phone}</span>
                  <a
                    href={`https://wa.me/${order.customer.phone.replace(/^0/, '94')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full hover:bg-green-200 font-semibold"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              {order.customer.email && (
                <div>
                  <div className="text-gray-400 mb-1">Email</div>
                  <div className="font-medium">{order.customer.email}</div>
                </div>
              )}
              <div>
                <div className="text-gray-400 mb-1">Payment</div>
                <div className="font-medium">{order.paymentMethod} — {order.paymentStatus}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-gray-400 mb-1">Delivery Address</div>
                <div className="font-medium">
                  {order.customer.deliveryAddress.line1}, {order.customer.deliveryAddress.city},
                  {' '}{order.customer.deliveryAddress.district}, {order.customer.deliveryAddress.province}
                </div>
              </div>
              {order.orderNotes && (
                <div className="sm:col-span-2">
                  <div className="text-gray-400 mb-1">Order Notes</div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 font-medium text-yellow-800">
                    {order.orderNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status + Timeline */}
        <div className="space-y-6">
          {/* Update Status */}
          {hasPermission('orders_update_status') && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Update Status</h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} disabled={s === 'Cancelled' && !hasPermission('orders_refund')}>{s}</option>
                ))}
              </select>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-sans"
                rows={2}
              />
              {newStatus === 'Cancelled' && (
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Cancellation reason (required)..."
                  className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none font-sans"
                  rows={2}
                />
              )}
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {updating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Updating...</>
                ) : 'Update Status'}
              </button>
            </div>
          )}

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Status History</h3>
            <div className="space-y-4">
              {(order.statusHistory ?? []).slice().reverse().map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${i === 0 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    {i < (order.statusHistory.length - 1) && (
                      <div className="w-0.5 h-full bg-gray-100 my-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <div className="font-semibold text-sm text-gray-700">{entry.status}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(entry.changedAt as { toDate(): Date })}</div>
                    {entry.note && <div className="text-xs text-gray-500 mt-1 bg-gray-50 rounded px-2 py-1">{entry.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Number */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-3">Tracking Number</h3>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={!hasPermission('orders_edit')}
                defaultValue={order.trackingNumber ?? ''}
                placeholder="Enter tracking #"
                id={`tracking-${order.id}`}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
              {hasPermission('orders_edit') && (
                <button
                  onClick={async () => {
                    const input = document.getElementById(`tracking-${order.id}`) as HTMLInputElement;
                    const { updateOrderTracking } = await import('../../../lib/firestore');
                    await updateOrderTracking(order.id, input.value);
                    toast.success('Tracking number saved');
                  }}
                  className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
