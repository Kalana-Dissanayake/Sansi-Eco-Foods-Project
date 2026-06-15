interface AdminTopbarProps {
  title: string;
  pendingOrders?: number;
  userName?: string;
}

export default function AdminTopbar({ title, pendingOrders = 0, userName }: AdminTopbarProps) {
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 font-sans">
      <div>
        <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
        <p className="text-[10px] text-slate-400 font-medium">Welcome back — here's what's happening</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Calendar Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-600 font-semibold shadow-sm">
          <span>📅</span>
          <span>{currentDateStr}</span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-600"
          aria-label="Notifications"
          title={`${pendingOrders} pending orders`}
        >
          <span className="text-base">🔔</span>
          {pendingOrders > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          )}
        </button>

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
