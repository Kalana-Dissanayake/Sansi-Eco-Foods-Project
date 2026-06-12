'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { getAllProducts, updateProductStock, updateProduct, deleteProduct } from '../../lib/firestore';
import type { Product } from '../../../shared/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<{ id: string; value: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await getAllProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStockUpdate = async (id: string) => {
    if (!editingStock) return;
    try {
      await updateProductStock(id, editingStock.value);
      toast.success('Stock updated');
      setEditingStock(null);
      load();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive });
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = searchQuery
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.skuCode.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  return (
    <AdminLayout title="Products">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Products</h2>
          <div className="flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
            />
            <Link
              href="/products/new"
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors"
            >
              ➕ Add Product
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🛍️</div>
              <p>No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!product.isActive ? 'opacity-50' : ''}`}>
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
                            {product.images[0] && (
                              <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{product.name}</div>
                            <div className="text-xs text-gray-400">{product.weightGrams}g</div>
                          </div>
                        </div>
                      </td>
                      {/* SKU */}
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.skuCode}</td>
                      {/* Price */}
                      <td className="px-4 py-3 font-bold text-green-700">Rs. {product.priceLKR.toLocaleString()}</td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        {editingStock?.id === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingStock.value}
                              onChange={(e) => setEditingStock({ id: product.id, value: parseInt(e.target.value) || 0 })}
                              className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                              min={0}
                            />
                            <button
                              onClick={() => handleStockUpdate(product.id)}
                              className="px-2 py-1 bg-green-700 text-white rounded-lg text-xs hover:bg-green-800"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingStock(null)}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingStock({ id: product.id, value: product.stockQuantity })}
                            className="flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                          >
                            <span className={`font-semibold ${product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity <= product.lowStockThreshold ? 'text-orange-600' : 'text-gray-700'}`}>
                              {product.stockQuantity}
                            </span>
                            <span className="text-gray-400 text-xs">✏️</span>
                          </button>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${product.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-label={product.isActive ? 'Deactivate product' : 'Activate product'}
                        >
                          <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${product.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/products/${product.id}`}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium"
                          >
                            Delete
                          </button>
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
    </AdminLayout>
  );
}
