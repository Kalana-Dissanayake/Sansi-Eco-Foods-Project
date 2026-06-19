'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';
import { getCustomers, updateCustomerNotes, deleteCustomer } from '../../lib/firestore';
import type { Customer } from '../../../shared/types';

function formatDate(ts: { toDate(): Date } | null): string {
  if (!ts) return '-';
  return new Intl.DateTimeFormat('en-LK', { day: '2-digit', month: 'short', year: 'numeric' }).format(ts.toDate());
}

export default function CustomersPage() {
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string } | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveNotes = async (customerId: string) => {
    if (!editingNotes || !hasPermission('customers_edit')) return;
    try {
      await updateCustomerNotes(customerId, editingNotes.notes);
      setCustomers((prev) => prev.map((c) => c.id === customerId ? { ...c, notes: editingNotes.notes } : c));
      setEditingNotes(null);
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleteOpen(false);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = searchQuery
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : customers;

  return (
    <AdminLayout title="Customers" requiredPermission="customers_view">
      <div className="space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{customers.length} customers total</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">👥</div>
              <p>No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Customer', 'Phone', 'District', 'Orders', 'Total Spent', 'Last Order', 'Notes', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                            {customer.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{customer.name}</div>
                            {customer.email && <div className="text-xs text-gray-400">{customer.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${customer.phone.replace(/^0/, '94')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-green-700"
                        >
                          {customer.phone}
                          <span className="text-xs">📱</span>
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{customer.lastDeliveryAddress?.district ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold">{customer.orderCount}</td>
                      <td className="px-4 py-3 font-bold text-green-700">Rs. {customer.totalSpentLKR.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(customer.lastOrderAt as { toDate(): Date } | null)}</td>
                      <td className="px-4 py-3">
                        {editingNotes?.id === customer.id ? (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={editingNotes.notes}
                              onChange={(e) => setEditingNotes({ id: customer.id, notes: e.target.value })}
                              className="w-36 px-2 py-1 border border-gray-200 rounded text-xs"
                            />
                            <button onClick={() => handleSaveNotes(customer.id)} className="px-2 py-1 bg-green-700 text-white rounded text-xs">✓</button>
                            <button onClick={() => setEditingNotes(null)} className="px-2 py-1 bg-gray-100 rounded text-xs">✕</button>
                          </div>
                        ) : (
                          <button
                            disabled={!hasPermission('customers_edit')}
                            onClick={() => setEditingNotes({ id: customer.id, notes: customer.notes ?? '' })}
                            className={`text-gray-400 text-xs max-w-xs text-left truncate ${hasPermission('customers_edit') ? 'hover:text-gray-600' : 'cursor-default'}`}
                          >
                            {customer.notes ? customer.notes : hasPermission('customers_edit') ? '+ Add note' : 'No notes'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium"
                          >
                            View
                          </Link>
                          {hasPermission('customers_edit') && (
                            <button
                              onClick={() => handleDeleteTrigger(customer.id, customer.name)}
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
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
      />
    </AdminLayout>
  );
}
