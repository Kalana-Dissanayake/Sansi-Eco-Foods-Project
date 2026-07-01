'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from '../../components/layout/AdminLayout';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

// ─── Types ─────────────────────────────────────────────────────────────────────

type NotificationType = 'order_placed' | 'message' | 'stock_alert' | 'order_cancelled' | 'new_customer';
type FilterTab = 'all' | 'unread' | 'orders' | 'messages' | 'stock_alerts';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: any;
  orderId?: string;
  orderNumber?: string;
  productId?: string;
  productName?: string;
  customerId?: string;
  customerName?: string;
  messageId?: string;
  linkTo?: string;
}

// Contact message shape from the old inbox (still read from contact_messages)
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: any;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const NOTIF_META: Record<NotificationType, { icon: string; bgColor: string; textColor: string; label: string }> = {
  order_placed:    { icon: '🛒', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', label: 'Order' },
  message:         { icon: '✉️', bgColor: 'bg-indigo-50',  textColor: 'text-indigo-700',  label: 'Message' },
  stock_alert:     { icon: '⚠️', bgColor: 'bg-amber-50',   textColor: 'text-amber-700',   label: 'Stock Alert' },
  order_cancelled: { icon: '❌', bgColor: 'bg-rose-50',    textColor: 'text-rose-700',    label: 'Cancellation' },
  new_customer:    { icon: '👤', bgColor: 'bg-sky-50',     textColor: 'text-sky-700',     label: 'New Customer' },
};

const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: 'all',          label: 'All',          icon: '📋' },
  { key: 'unread',       label: 'Unread',       icon: '🔵' },
  { key: 'orders',       label: 'Orders',       icon: '🛒' },
  { key: 'messages',     label: 'Messages',     icon: '✉️' },
  { key: 'stock_alerts', label: 'Stock Alerts', icon: '⚠️' },
];

function formatDate(ts: any): string {
  if (!ts) return '';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  return date.toLocaleString('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(ts: any): string {
  if (!ts) return '';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(ts);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<Notification | null>(null);
  const [contactMessage, setContactMessage] = useState<ContactMessage | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Deletion modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

  // ─── Load notifications ───────────────────────────────────────────────────

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
        setNotifications(data);
        setLoading(false);
      },
      () => {
        toast.error('Failed to load notifications');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // ─── Load contact message detail when selecting a message notification ────

  useEffect(() => {
    if (!selected) {
      setContactMessage(null);
      return;
    }
    if (selected.type === 'message' && selected.messageId) {
      setLoadingDetail(true);
      const fetch = async () => {
        try {
          const snap = await getDocs(
            query(collection(db, 'contact_messages'), where('__name__', '==', selected.messageId!))
          );
          if (!snap.empty) {
            setContactMessage({ id: snap.docs[0].id, ...snap.docs[0].data() } as ContactMessage);
          } else {
            setContactMessage(null);
          }
        } catch {
          setContactMessage(null);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetch();
    } else {
      setContactMessage(null);
    }
  }, [selected?.id]);

  // ─── Select notification ──────────────────────────────────────────────────

  const handleSelect = useCallback(async (notif: Notification) => {
    setSelected(notif);
    if (!notif.read) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { read: true });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
        setSelected((prev) => prev?.id === notif.id ? { ...prev, read: true } : prev);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }

      // Also mark underlying contact_message as read if it's a message notification
      if (notif.type === 'message' && notif.messageId) {
        updateDoc(doc(db, 'contact_messages', notif.messageId), { read: true }).catch(() => {});
      }
    }
  }, []);

  // ─── Toggle read ─────────────────────────────────────────────────────────

  const handleToggleRead = async (notif: Notification) => {
    try {
      const next = !notif.read;
      await updateDoc(doc(db, 'notifications', notif.id), { read: next });
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: next } : n)));
      if (selected?.id === notif.id) setSelected({ ...notif, read: next });
      toast.success(next ? 'Marked as read' : 'Marked as unread');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ─── Mark all as read ─────────────────────────────────────────────────────

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    try {
      const batch = writeBatch(db);
      unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success(`${unread.length} notification${unread.length > 1 ? 's' : ''} marked as read`);
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteTrigger = (notif: Notification) => {
    setDeleteTarget(notif);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleteOpen(false);
    try {
      await deleteDoc(doc(db, 'notifications', deleteTarget.id));
      setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filtered = notifications.filter((n) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'unread') return !n.read;
    if (filterTab === 'orders') return n.type === 'order_placed' || n.type === 'order_cancelled';
    if (filterTab === 'messages') return n.type === 'message';
    if (filterTab === 'stock_alerts') return n.type === 'stock_alert';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AdminLayout
      title="Notifications"
      description="Stay updated with orders, messages, stock alerts and customer activity."
      requiredPermission="messages_view"
    >
      <div className="space-y-5 font-sans h-[calc(100vh-140px)] flex flex-col">

        {/* Header: Filter Tabs + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          {/* Filter tabs */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm self-start text-xs font-bold gap-0.5 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const count = tab.key === 'all'
                ? notifications.length
                : tab.key === 'unread'
                ? unreadCount
                : tab.key === 'orders'
                ? notifications.filter((n) => n.type === 'order_placed' || n.type === 'order_cancelled').length
                : tab.key === 'messages'
                ? notifications.filter((n) => n.type === 'message').length
                : notifications.filter((n) => n.type === 'stock_alert').length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    filterTab === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      filterTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all self-start"
            >
              ✓ Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex gap-5 overflow-hidden min-h-0">

            {/* ── Left Panel: Notification List ── */}
            <div className="w-full md:w-80 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-slate-50 font-bold text-xs text-slate-400 tracking-wider flex justify-between items-center bg-slate-50/50">
                <span>ACTIVITY FEED</span>
                <span>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {filtered.map((notif) => {
                  const meta = NOTIF_META[notif.type] ?? NOTIF_META.message;
                  const isActive = selected?.id === notif.id;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleSelect(notif)}
                      className={`w-full p-4 text-left flex gap-3 transition-colors hover:bg-slate-50/70 items-start ${
                        isActive ? 'bg-indigo-50/50 border-l-4 border-indigo-600 pl-3' : ''
                      }`}
                    >
                      {/* Type icon */}
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${meta.bgColor}`}>
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[11px] font-extrabold truncate ${!notif.read ? 'text-slate-800' : 'text-slate-500'}`}>
                            {notif.title}
                          </span>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{notif.body}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${meta.bgColor} ${meta.textColor}`}>
                            {meta.label}
                          </span>
                          <span className="text-[9px] text-slate-400">{timeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <div className="text-3xl">🔔</div>
                    <p className="text-xs">No notifications in this category</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel: Detail View ── */}
            <div className="hidden md:flex flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex-col">
              {selected ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-slate-50 flex justify-between items-start flex-shrink-0 bg-slate-50/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${NOTIF_META[selected.type]?.bgColor ?? 'bg-slate-50'}`}>
                        {NOTIF_META[selected.type]?.icon ?? '🔔'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-sm leading-tight">{selected.title}</h3>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{formatDate(selected.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRead(selected)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          selected.read
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                        }`}
                      >
                        {selected.read ? '✉️ Mark Unread' : '👁️ Mark Read'}
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(selected)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold transition-all"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Detail Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Notification body */}
                    <div className="bg-slate-50/70 rounded-xl p-4">
                      <p className="text-sm text-slate-700 leading-relaxed">{selected.body}</p>
                    </div>

                    {/* Type-specific detail panels */}

                    {/* Order panel */}
                    {(selected.type === 'order_placed' || selected.type === 'order_cancelled') && selected.orderId && (
                      <div className="border border-slate-100 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Order Details</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {selected.orderNumber ? `Order ${selected.orderNumber}` : 'Order'}
                            </div>
                            {selected.customerName && (
                              <div className="text-[11px] text-slate-500 mt-0.5">Customer: {selected.customerName}</div>
                            )}
                          </div>
                          <Link
                            href={`/orders/${selected.orderId}`}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            View Order →
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Stock alert panel */}
                    {selected.type === 'stock_alert' && selected.productId && (
                      <div className="border border-amber-100 bg-amber-50/40 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">⚠️ Stock Alert</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-800">{selected.productName || 'Product'}</div>
                          <Link
                            href={`/products`}
                            className="px-3 py-1.5 bg-amber-500 text-white text-[11px] font-bold rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Manage Stock →
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* New customer panel */}
                    {selected.type === 'new_customer' && selected.customerId && (
                      <div className="border border-sky-100 bg-sky-50/40 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-extrabold text-sky-600 uppercase tracking-wider">👤 New Customer</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-800">{selected.customerName || 'Customer'}</div>
                          <Link
                            href={`/customers`}
                            className="px-3 py-1.5 bg-sky-500 text-white text-[11px] font-bold rounded-lg hover:bg-sky-600 transition-colors"
                          >
                            View Customers →
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Message inbox panel */}
                    {selected.type === 'message' && (
                      <div className="border border-indigo-100 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-indigo-50/50 border-b border-indigo-100">
                          <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">✉️ Message Content</h4>
                        </div>
                        {loadingDetail ? (
                          <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : contactMessage ? (
                          <div className="p-4 space-y-3">
                            {/* Sender info */}
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                                {contactMessage.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800">{contactMessage.name}</div>
                                <a href={`mailto:${contactMessage.email}`} className="text-[11px] text-indigo-600 hover:underline">
                                  {contactMessage.email}
                                </a>
                              </div>
                            </div>
                            {contactMessage.subject && (
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subject</div>
                                <div className="text-xs font-semibold text-slate-700">{contactMessage.subject}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message</div>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 rounded-lg p-3">
                                {contactMessage.message}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-slate-400 text-xs py-8">
                            Message content not available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <div className="text-5xl">🔔</div>
                  <div className="text-center">
                    <h4 className="font-bold text-slate-800 text-sm">No Notification Selected</h4>
                    <p className="text-xs mt-0.5">Choose a notification from the list to view details.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This cannot be undone."
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
