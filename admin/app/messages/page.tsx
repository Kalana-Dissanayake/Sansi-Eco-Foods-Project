'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from '../../components/layout/AdminLayout';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: any;
}

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

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterTab, setFilterTab] = useState<'unread' | 'all'>('unread');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
      setMessages(data);

      // Keep currently selected message updated or default to first message
      if (data.length > 0) {
        if (selectedMessage) {
          const updated = data.find((m) => m.id === selectedMessage.id);
          if (updated) setSelectedMessage(updated);
        }
      } else {
        setSelectedMessage(null);
      }
    } catch (err) {
      toast.error('Failed to load messages inbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    // Auto-mark as read if unread
    if (!msg.read) {
      try {
        await updateDoc(doc(db, 'contact_messages', msg.id), { read: true });
        // Update in state locally
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
        );
        setSelectedMessage({ ...msg, read: true });
      } catch (err) {
        console.error('Failed to auto-mark message as read:', err);
      }
    }
  };

  const handleToggleReadStatus = async (msg: Message) => {
    try {
      const nextReadState = !msg.read;
      await updateDoc(doc(db, 'contact_messages', msg.id), { read: nextReadState });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: nextReadState } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, read: nextReadState });
      }
      toast.success(nextReadState ? 'Message marked as read' : 'Message marked as unread');
    } catch {
      toast.error('Failed to update status');
    }
  };
  
  const handleDeleteTrigger = (msg: Message) => {
    setDeleteTarget(msg);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleteOpen(false);
    try {
      await deleteDoc(doc(db, 'contact_messages', deleteTarget.id));
      toast.success('Message deleted successfully');
      setSelectedMessage(null);
      setDeleteTarget(null);
      loadMessages();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filterTab === 'unread') return !m.read;
    return true;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <AdminLayout title="Messages & Inquiries" requiredPermission="messages_view">
      <div className="space-y-6 font-sans h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Messages Inbox</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage customer inquiries and feedback received from the store site.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm self-start text-xs font-bold">
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-4 py-2 rounded-lg transition-all ${filterTab === 'unread' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📥 Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-lg transition-all ${filterTab === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📂 All Messages ({messages.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            {/* Left Panel: Messages List */}
            <div className="w-full md:w-80 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-slate-50 font-bold text-xs text-slate-400 tracking-wider flex justify-between items-center bg-slate-50/50">
                <span>INBOX QUEUE</span>
                <span>{filteredMessages.length} Messages</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`w-full p-4 text-left flex gap-3 transition-colors hover:bg-slate-50/70 items-start ${selectedMessage?.id === msg.id ? 'bg-indigo-50/40 border-l-4 border-indigo-600 pl-3' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 text-xs font-black flex items-center justify-center shadow-inner ${!msg.read ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {getInitials(msg.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className={`text-xs truncate ${!msg.read ? 'font-black text-slate-800' : 'font-semibold text-slate-600'}`}>{msg.name}</span>
                        {!msg.read && <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />}
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 ${!msg.read ? 'font-bold text-slate-700' : 'text-slate-400'}`}>{msg.subject}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-1 truncate">{msg.message}</div>
                    </div>
                  </button>
                ))}

                {filteredMessages.length === 0 && (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <div className="text-3xl">📭</div>
                    <p className="text-xs">No messages in this tab</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Reading Pane */}
            <div className="hidden md:flex flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex-col">
              {selectedMessage ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Subject and Actions Header */}
                  <div className="p-6 border-b border-slate-50 flex justify-between items-start flex-shrink-0 bg-slate-50/20">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base leading-tight">{selectedMessage.subject}</h3>
                      <span className="text-[10px] text-slate-400 block mt-1">Received: {formatDate(selectedMessage.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleReadStatus(selectedMessage)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          selectedMessage.read
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                        }`}
                      >
                        {selectedMessage.read ? '✉️ Mark Unread' : '👁️ Mark Read'}
                      </button>
                      <button
                        onClick={() => handleDeleteTrigger(selectedMessage)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold transition-all"
                      >
                        🗑️ Delete Inquiry
                      </button>
                    </div>
                  </div>

                  {/* Sender Profile Header */}
                  <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-black flex items-center justify-center shadow-inner">
                      {getInitials(selectedMessage.name)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{selectedMessage.name}</div>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-[11px] text-indigo-600 hover:underline font-semibold block mt-0.5"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 p-6 overflow-y-auto font-sans leading-relaxed text-sm text-slate-600 whitespace-pre-line bg-slate-50/10">
                    {selectedMessage.message}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <div className="text-5xl">✉️</div>
                  <div className="text-center">
                    <h4 className="font-bold text-slate-800 text-sm">No Inquiry Selected</h4>
                    <p className="text-xs mt-0.5">Choose a message from the list to read its content.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
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
