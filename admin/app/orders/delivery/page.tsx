'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useAuth } from '../../../hooks/useAuth';
import { getOrders, claimOrderDelivery, markOrderDelivered } from '../../../lib/firestore';
import type { Order } from '../../../../shared/types';

export default function DeliveryQueuePage() {
  const { user, adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      // Fetch active orders
      const data = await getOrders();
      setOrders(data);
    } catch {
      toast.error('Failed to load delivery queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  if (!user || !adminUser) return null;

  // Filter available orders (Pending/Confirmed/Processing and not assigned yet)
  const availableDeliveries = orders.filter(
    (o) =>
      (o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing') &&
      !o.driverId
  );

  // Filter current driver's active assignments
  const myDeliveries = orders.filter(
    (o) =>
      o.driverId === user.uid &&
      o.orderStatus !== 'Delivered' &&
      o.orderStatus !== 'Cancelled'
  );

  const handleClaim = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      const driverName = adminUser.displayName || adminUser.email;
      await claimOrderDelivery(orderId, user.uid, driverName);
      toast.success('Delivery claimed! Check My Deliveries tab.');
      await loadDeliveries();
    } catch {
      toast.error('Failed to claim delivery');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeliver = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await markOrderDelivered(orderId, user.uid);
      toast.success('Order marked as Delivered!');
      await loadDeliveries();
    } catch {
      toast.error('Failed to complete delivery');
    } finally {
      setProcessingId(null);
    }
  };

  const formatLKR = (val: number) => `Rs. ${val.toLocaleString()}`;

  return (
    <AdminLayout title="Delivery Dashboard" requiredPermission="orders_delivery_queue">
      <div className="max-w-md mx-auto space-y-4 pb-8">
        {/* Header summary */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-800 text-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold opacity-75">Welcome, Driver</h3>
          <h2 className="text-xl font-bold mt-1">{adminUser.displayName}</h2>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20 text-center">
            <div>
              <div className="text-2xl font-black">{availableDeliveries.length}</div>
              <div className="text-xs opacity-75">Available Runs</div>
            </div>
            <div>
              <div className="text-2xl font-black">{myDeliveries.length}</div>
              <div className="text-xs opacity-75">My Active Runs</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'available'
                ? 'bg-green-700 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Available Runs ({availableDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'mine'
                ? 'bg-green-700 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🛵 My Deliveries ({myDeliveries.length})
          </button>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'available' && (
              <>
                {availableDeliveries.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded">
                          {order.orderNumber}
                        </span>
                        <div className="font-bold text-gray-800 mt-1">{order.customer.deliveryAddress.city}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-green-700">{formatLKR(order.totalLKR)}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{order.items.length} items</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div><strong className="text-gray-600">Address:</strong> {order.customer.deliveryAddress.line1}, {order.customer.deliveryAddress.city}</div>
                      {order.orderNotes && <div><strong className="text-gray-600">Notes:</strong> {order.orderNotes}</div>}
                    </div>

                    <button
                      onClick={() => handleClaim(order.id)}
                      disabled={processingId !== null}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {processingId === order.id ? 'Claiming...' : '🛵 Claim Run & Assign Me'}
                    </button>
                  </div>
                ))}

                {availableDeliveries.length === 0 && (
                  <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl text-gray-400">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-sm">No runs available right now</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'mine' && (
              <>
                {myDeliveries.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                      <div>
                        <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded border border-green-100">
                          {order.orderNumber}
                        </span>
                        <div className="font-bold text-gray-800 mt-1">{order.customer.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-green-700">{formatLKR(order.totalLKR)}</div>
                        <div className="text-xs text-gray-400 font-bold">{order.paymentMethod}</div>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <div>
                        <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Address</div>
                        <div className="font-medium text-gray-700 mt-0.5">
                          {order.customer.deliveryAddress.line1}, {order.customer.deliveryAddress.city}, {order.customer.deliveryAddress.district}
                        </div>
                      </div>

                      {order.orderNotes && (
                        <div className="bg-yellow-50 border border-yellow-100 p-2.5 rounded-lg text-yellow-800">
                          <div className="font-bold text-[9px] uppercase tracking-wider">Driver/Delivery Notes</div>
                          <div className="font-medium mt-0.5">{order.orderNotes}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${order.customer.phone}`}
                          className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-center font-bold text-gray-700"
                        >
                          📞 Call Customer
                        </a>
                        <a
                          href={`https://wa.me/${order.customer.phone.replace(/^0/, '94')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-center font-bold text-green-700"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeliver(order.id)}
                      disabled={processingId !== null}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {processingId === order.id ? 'Updating...' : '✅ Mark as Delivered & Paid'}
                    </button>
                  </div>
                ))}

                {myDeliveries.length === 0 && (
                  <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl text-gray-400">
                    <div className="text-3xl mb-2">🛵</div>
                    <p className="text-sm">You have no claimed deliveries</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
