'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface AdminTopbarProps {
  title: string;
  description?: string;
  pendingOrders?: number;
  userName?: string;
}

interface NotificationItem {
  id: string;
  type: 'order_placed' | 'message' | 'stock_alert' | 'order_cancelled' | 'new_customer' | 'review';
  title: string;
  body: string;
  read: boolean;
  createdAt: any;
  linkTo?: string;
}

const NOTIF_META: Record<NotificationItem['type'], { icon: string; color: string }> = {
  order_placed:    { icon: '🛒', color: 'text-emerald-600' },
  message:         { icon: '✉️', color: 'text-indigo-600' },
  stock_alert:     { icon: '⚠️', color: 'text-amber-600' },
  order_cancelled: { icon: '❌', color: 'text-rose-600' },
  new_customer:    { icon: '👤', color: 'text-sky-600' },
  review:          { icon: '⭐', color: 'text-yellow-600' },
};

export default function AdminTopbar({ title, description, pendingOrders = 0, userName }: AdminTopbarProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as NotificationItem[];
      setNotifications(items);
    }, (err) => {
      console.error('Error fetching notifications:', err);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleNotifClick = (notif: NotificationItem) => {
    setIsOpen(false);
    if (notif.linkTo) {
      window.location.href = notif.linkTo;
    } else {
      window.location.href = '/notifications';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 font-sans">
      <div>
        <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
        {description && <p className="text-[10px] text-slate-400 font-medium">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Calendar Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600 font-semibold shadow-sm">
          <span>📅</span>
          <span>{currentDateStr}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-600"
            aria-label="Notifications"
            title={`${unreadCount} unread notifications`}
          >
            <span className="text-base">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((notif) => {
                  const meta = NOTIF_META[notif.type] ?? { icon: '🔔', color: 'text-slate-600' };
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer flex gap-3 items-start text-left ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`font-bold text-xs truncate ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex-shrink-0"
                              title="Mark as read"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-2">{notif.body}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );
                })}
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <div className="text-3xl mb-2">🔔</div>
                    No notifications yet
                  </div>
                )}
              </div>
              <div className="px-4 pt-2 border-t border-slate-50 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 block py-1"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Status */}
        {userName && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shadow-inner">
              {userName[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-600 hidden sm:block">{userName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
