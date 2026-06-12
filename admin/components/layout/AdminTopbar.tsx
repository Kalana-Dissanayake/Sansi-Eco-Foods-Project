interface AdminTopbarProps {
  title: string;
  pendingOrders?: number;
  userName?: string;
}

export default function AdminTopbar({ title, pendingOrders = 0, userName }: AdminTopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-xl font-bold text-gray-800 font-sans">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
          title={`${pendingOrders} pending orders`}
        >
          <span className="text-xl">🔔</span>
          {pendingOrders > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center justify-content-center">
              {pendingOrders > 9 ? '9+' : pendingOrders}
            </span>
          )}
        </button>

        {/* User Avatar */}
        {userName && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-700 text-white text-sm font-bold flex items-center justify-center">
              {userName[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">{userName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
