import Link from 'next/link';
import type { Order } from '../../../shared/types';

interface RecentOrdersProps {
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Dispatched: 'bg-orange-100 text-orange-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

function formatDate(timestamp: { toDate(): Date } | Date | null): string {
  if (!timestamp) return '-';
  const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : timestamp as Date;
  return new Intl.DateTimeFormat('en-LK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📦</div>
        <p>No orders yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {['Order #', 'Customer', 'Total', 'Status', 'Date', ''].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-gray-800">{order.orderNumber}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-700">{order.customer.name}</div>
                <div className="text-xs text-gray-400">{order.customer.phone}</div>
              </td>
              <td className="px-4 py-3 font-bold text-green-700">Rs. {order.totalLKR.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.orderStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                  {order.orderStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(order.createdAt as { toDate(): Date })}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-green-700 hover:text-green-900 font-medium text-xs hover:underline"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
