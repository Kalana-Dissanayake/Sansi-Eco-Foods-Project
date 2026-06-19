'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import OrderStatusBadge from '../../../components/orders/OrderStatusBadge';
import { useAuth } from '../../../hooks/useAuth';
import { getCustomerById, getCustomerOrders, deleteCustomer } from '../../../lib/firestore';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import type { Customer, Order } from '../../../../shared/types';

function formatDate(ts: { toDate(): Date } | null): string {
  if (!ts) return '-';
  return new Intl.DateTimeFormat('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(ts.toDate());
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission } = useAuth();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        const cust = await getCustomerById(params.id);
        if (cust) {
          setCustomer(cust);
          // Fetch orders using customer phone
          const customerOrders = await getCustomerOrders(cust.phone);
          setOrders(customerOrders);
        } else {
          toast.error('Customer not found');
        }
      } catch (err) {
        console.error('Error loading customer details:', err);
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleDeleteTrigger = () => {
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customer) return;
    setIsDeleteOpen(false);
    try {
      await deleteCustomer(customer.id);
      toast.success('Customer deleted');
      router.push('/customers');
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  return (
    <AdminLayout title="Customer Details" requiredPermission="customers_view">
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/customers"
              className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Customer Profile</h2>
              <p className="text-xs text-gray-400">View customer metrics and order history</p>
            </div>
          </div>
          {customer && hasPermission('customers_edit') && (
            <button
              onClick={handleDeleteTrigger}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors"
            >
              🗑️ Delete Customer
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !customer ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-lg font-bold text-gray-700">Customer Not Found</h3>
            <p className="text-sm mt-1">This record might have been deleted or the ID is invalid.</p>
            <Link href="/customers" className="inline-block mt-4 px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-bold">
              Return to Customers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 h-fit">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 font-extrabold text-2xl flex items-center justify-center flex-shrink-0">
                  {customer.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
                  <p className="text-xs text-gray-400">Member since {formatDate(customer.createdAt as { toDate(): Date } | null)}</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</h4>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <a
                      href={`https://wa.me/${customer.phone.replace(/^0/, '94')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-green-700 hover:underline"
                    >
                      {customer.phone} 📱
                    </a>
                  </div>
                  {customer.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <a href={`mailto:${customer.email}`} className="font-semibold text-gray-700 hover:underline">
                        {customer.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shopping Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="text-xs text-gray-400 font-semibold uppercase">Total Spent</div>
                    <div className="text-lg font-bold text-green-700 mt-1">Rs. {customer.totalSpentLKR.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="text-xs text-gray-400 font-semibold uppercase">Orders</div>
                    <div className="text-lg font-bold text-gray-800 mt-1">{customer.orderCount}</div>
                  </div>
                </div>
              </div>

              {customer.lastDeliveryAddress && (
                <>
                  <hr className="border-gray-100" />
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Delivery Address</h4>
                    <div className="text-sm bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-1 text-gray-700">
                      <div className="font-medium">{customer.lastDeliveryAddress.line1}</div>
                      <div>{customer.lastDeliveryAddress.city}</div>
                      <div className="text-xs text-gray-500">{customer.lastDeliveryAddress.district} District</div>
                    </div>
                  </div>
                </>
              )}

              {customer.notes && (
                <>
                  <hr className="border-gray-100" />
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Notes</h4>
                    <div className="text-sm italic bg-yellow-50/50 border border-yellow-100 text-gray-600 rounded-xl p-4">
                      {customer.notes}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Orders list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Order History</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <div className="text-4xl mb-2">🛍️</div>
                    <p className="text-sm">No orders found for this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-left text-gray-500">
                          <th className="px-4 py-3 text-xs font-bold uppercase">Order #</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase">Date</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase">Items</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase">Total</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase">Status</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-800">{order.orderNumber}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.createdAt as { toDate(): Date })}</td>
                            <td className="px-4 py-3 text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </td>
                            <td className="px-4 py-3 font-bold text-green-700">Rs. {order.totalLKR.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <OrderStatusBadge status={order.orderStatus} size="sm" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/orders/${order.id}`}
                                className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors"
                              >
                                View Order
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {customer && (
        <ConfirmationModal
          isOpen={isDeleteOpen}
          title="Delete Customer"
          message={`Are you sure you want to delete customer "${customer.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          type="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}
    </AdminLayout>
  );
}
