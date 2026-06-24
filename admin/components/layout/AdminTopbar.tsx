'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface AdminTopbarProps {
  title: string;
  description?: string;
  pendingOrders?: number;
  userName?: string;
}

export default function AdminTopbar({ title, description, pendingOrders = 0, userName }: AdminTopbarProps) {
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    const q = query(
      collection(db, 'contact_messages'),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUnreadMessages(msgs);
    }, (err) => {
      console.error('Error fetching unread messages:', err);
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

  const handleMarkAsRead = async (msgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'contact_messages', msgId), { read: true });
      toast.success('Message marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

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
            title={`${unreadMessages.length} unread messages`}
          >
            <span className="text-base">🔔</span>
            {unreadMessages.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadMessages.length}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Unread Messages</span>
                {unreadMessages.length > 0 && (
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    {unreadMessages.length} new
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {unreadMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/messages';
                    }}
                    className="px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col gap-1 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{msg.name}</span>
                      <button
                        onClick={(e) => handleMarkAsRead(msg.id, e)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
                        title="Mark as read"
                      >
                        Mark read
                      </button>
                    </div>
                    <span className="font-semibold text-slate-600 text-[10px] truncate">{msg.subject}</span>
                    <p className="text-slate-400 text-[10px] truncate">{msg.message}</p>
                  </div>
                ))}
                {unreadMessages.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">No unread messages</div>
                )}
              </div>
              <div className="px-4 pt-2 border-t border-slate-50 text-center">
                <Link
                  href="/messages"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 block py-1"
                >
                  View all messages
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
