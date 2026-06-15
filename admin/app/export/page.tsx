'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from '../../components/layout/AdminLayout';

export default function ExportDataPage() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ orders: 0, products: 0, customers: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [ordersSnap, productsSnap, customersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'customers')),
        ]);
        setCounts({
          orders: ordersSnap.size,
          products: productsSnap.size,
          customers: customersSnap.size,
        });
      } catch (err) {
        console.error('Error loading collections counts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCounts();
  }, []);

  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOrders = async () => {
    toast.loading('Preparing orders export...', { id: 'export-orders' });
    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (snap.empty) {
        toast.error('No orders available to export', { id: 'export-orders' });
        return;
      }

      const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Email', 'Items Count', 'Subtotal LKR', 'Shipping LKR', 'Discount LKR', 'Total LKR', 'Payment Method', 'Payment Status', 'Status'];
      const rows = snap.docs.map((doc) => {
        const data = doc.data();
        const date = typeof data.createdAt?.toDate === 'function' ? data.createdAt.toDate() : new Date(data.createdAt);
        const dateStr = date.toLocaleString('en-LK');

        return [
          data.orderNumber ?? '',
          `"${dateStr}"`,
          `"${data.customer?.name ?? ''}"`,
          `"${data.customer?.phone ?? ''}"`,
          `"${data.customer?.email ?? ''}"`,
          data.items?.length ?? 0,
          data.subtotalLKR ?? 0,
          data.shippingLKR ?? 0,
          data.discountLKR ?? 0,
          data.totalLKR ?? 0,
          data.paymentMethod ?? '',
          data.paymentStatus ?? '',
          data.orderStatus ?? '',
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      downloadCSV(`orders_export_${Date.now()}.csv`, csvContent);
      toast.success('Orders database exported successfully!', { id: 'export-orders' });
    } catch (err) {
      toast.error('Failed to export orders data', { id: 'export-orders' });
    }
  };

  const handleExportProducts = async () => {
    toast.loading('Preparing products export...', { id: 'export-products' });
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        toast.error('No products available to export', { id: 'export-products' });
        return;
      }

      const headers = ['SKU', 'Product Name', 'Price LKR', 'Compare At Price LKR', 'Stock Quantity', 'Low Stock Threshold', 'In Stock Status', 'Active Status', 'Weight Grams', 'Packet Dimensions', 'Shelf Life', 'Health Tags'];
      const rows = snap.docs.map((doc) => {
        const data = doc.data();
        const tags = (data.healthTags ?? []).join(' | ');

        return [
          data.skuCode ?? '',
          `"${data.name ?? ''}"`,
          data.priceLKR ?? 0,
          data.compareAtPriceLKR ?? 0,
          data.stockQuantity ?? 0,
          data.lowStockThreshold ?? 0,
          data.inStock ? 'In Stock' : 'Out of Stock',
          data.isActive ? 'Active' : 'Inactive',
          data.weightGrams ?? 0,
          `"${data.packetDimensions ?? ''}"`,
          `"${data.shelfLife ?? ''}"`,
          `"${tags}"`,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      downloadCSV(`products_export_${Date.now()}.csv`, csvContent);
      toast.success('Products catalog exported successfully!', { id: 'export-products' });
    } catch {
      toast.error('Failed to export products data', { id: 'export-products' });
    }
  };

  const handleExportCustomers = async () => {
    toast.loading('Preparing customers export...', { id: 'export-customers' });
    try {
      const snap = await getDocs(collection(db, 'customers'));
      if (snap.empty) {
        toast.error('No customers available to export', { id: 'export-customers' });
        return;
      }

      const headers = ['Customer Name', 'Phone', 'Email', 'Total Orders', 'Total Spent LKR', 'Last Order At', 'Notes'];
      const rows = snap.docs.map((doc) => {
        const data = doc.data();
        const lastOrder = data.lastOrderAt ? (typeof data.lastOrderAt.toDate === 'function' ? data.lastOrderAt.toDate() : new Date(data.lastOrderAt)).toLocaleString('en-LK') : '-';

        return [
          `"${data.name ?? ''}"`,
          `"${data.phone ?? ''}"`,
          `"${data.email ?? ''}"`,
          data.totalOrders ?? 0,
          data.totalSpentLKR ?? 0,
          `"${lastOrder}"`,
          `"${(data.notes ?? '').replace(/"/g, '""')}"`,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      downloadCSV(`customers_export_${Date.now()}.csv`, csvContent);
      toast.success('Customers list exported successfully!', { id: 'export-customers' });
    } catch {
      toast.error('Failed to export customers data', { id: 'export-customers' });
    }
  };

  return (
    <AdminLayout title="Export Data" requiredPermission="dashboard_export_analytics">
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Export Databases</h2>
          <p className="text-xs text-slate-400 mt-0.5">Download database sheets as formatted CSV tables directly in your browser.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Orders Card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 flex items-center justify-center text-lg rounded-xl">
                  📦
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Orders Database</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export customer orders, totals, shipping info, dates, and order fulfillment status history.
                </p>
                <div className="pt-2">
                  <span className="bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {counts.orders} Records
                  </span>
                </div>
              </div>
              <button
                onClick={handleExportOrders}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                📥 Download CSV Sheet
              </button>
            </div>

            {/* Products Card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg rounded-xl">
                  🛍️
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Products Catalog</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export product SKU, names, price levels, stock status, weight specs, and shelf-life details.
                </p>
                <div className="pt-2">
                  <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {counts.products} Records
                  </span>
                </div>
              </div>
              <button
                onClick={handleExportProducts}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                📥 Download CSV Sheet
              </button>
            </div>

            {/* Customers Card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center text-lg rounded-xl">
                  👥
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Customers Database</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export customer metrics including order frequencies, total expenditures, phone logs, and notes.
                </p>
                <div className="pt-2">
                  <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {counts.customers} Records
                  </span>
                </div>
              </div>
              <button
                onClick={handleExportCustomers}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                📥 Download CSV Sheet
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
