'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../lib/firestore';
import type { Category } from '../../../shared/types';

interface EditState {
  id: string;
  name: string;
  parentName: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('menu_edit');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add new category state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState('Dehydrated Fruits');
  const [newActive, setNewActive] = useState(true);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getAllCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ── Add ──────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a category name.');
      return;
    }
    setSaving(true);
    try {
      const slug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const maxSort = categories.length > 0 ? Math.max(...categories.map((c) => c.sortOrder)) + 1 : 1;
      await createCategory({
        name: newName.trim(),
        parentName: newParent.trim() || 'Dehydrated Fruits',
        slug,
        sortOrder: maxSort,
        isActive: newActive,
      });
      toast.success(`Category "${newName.trim()}" created!`);
      setNewName('');
      setNewParent('Dehydrated Fruits');
      setNewActive(true);
      setShowAddForm(false);
      await load();
    } catch {
      toast.error('Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditState({
      id: cat.id,
      name: cat.name,
      parentName: cat.parentName,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const handleSaveEdit = async () => {
    if (!editState || !editState.name.trim()) {
      toast.error('Category name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateCategory(editState.id, {
        name: editState.name.trim(),
        parentName: editState.parentName.trim(),
        slug: editState.slug.trim() || editState.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        sortOrder: Number(editState.sortOrder),
        isActive: editState.isActive,
      });
      toast.success('Category updated!');
      cancelEdit();
      await load();
    } catch {
      toast.error('Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (cat: Category) => {
    if (!canEdit) return;
    try {
      await updateCategory(cat.id, { isActive: !cat.isActive });
      toast.success(`"${cat.name}" is now ${!cat.isActive ? 'Active' : 'Inactive'}.`);
      await load();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteTrigger = (cat: Category) => {
    setDeleteTarget(cat);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleteOpen(false);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Failed to delete category.');
    }
  };

  // Auto-generate slug as user types name in add form
  const derivedSlug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <AdminLayout
      title="Categories"
      description="Manage product categories — changes are reflected immediately on the website."
      requiredPermission="menu_view"
    >
      <div className="space-y-5 font-sans">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total
            {' · '}
            <span className="text-green-700 font-semibold">
              {categories.filter((c) => c.isActive).length} active
            </span>
            {' · '}
            <span className="text-gray-400">
              {categories.filter((c) => !c.isActive).length} inactive
            </span>
          </div>
          {canEdit && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors self-start"
            >
              ➕ Add Category
            </button>
          )}
        </div>

        {/* Info banner */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
          <span className="text-base flex-shrink-0 mt-0.5">🌐</span>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Categories marked as <strong>Active</strong> appear in the website&apos;s navigation
            menu and product filters in real-time. Inactive categories are hidden from customers
            but their products remain in the database.
          </p>
        </div>

        {/* Add New Category Form */}
        {showAddForm && canEdit && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-green-800 text-sm">Add New Category</h3>
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); }}
                className="text-green-600 hover:text-green-800 text-lg leading-none font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Dried Berries"
                  autoFocus
                />
                {newName.trim() && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Slug: <span className="font-mono text-gray-600">{derivedSlug}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Parent / Group Name
                </label>
                <input
                  type="text"
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Dehydrated Fruits"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewActive(!newActive)}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${newActive ? 'bg-green-500' : 'bg-gray-300'}`}
                aria-label="Toggle active"
              >
                <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${newActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {newActive ? 'Active — visible on website' : 'Inactive — hidden from customers'}
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); }}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newName.trim()}
                className="px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                ) : '✓ Create Category'}
              </button>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🏷️</div>
              <p>No categories found. Add your first category above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Category Name', 'Parent / Group', 'Slug', 'Sort Order', 'Website Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((cat) => {
                    const isEditing = editingId === cat.id;
                    return (
                      <tr key={cat.id} className={`hover:bg-gray-50/80 transition-colors ${!cat.isActive ? 'opacity-60' : ''}`}>
                        {/* Category Name */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editState!.name}
                              onChange={(e) => {
                                const name = e.target.value;
                                setEditState((prev) => prev ? ({
                                  ...prev,
                                  name,
                                  slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                                }) : prev);
                              }}
                              className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{cat.name}</span>
                              {!cat.isActive && (
                                <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Hidden
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Parent / Group */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editState!.parentName}
                              onChange={(e) => setEditState((prev) => prev ? ({ ...prev, parentName: e.target.value }) : prev)}
                              className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <span className="text-gray-500">{cat.parentName}</span>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editState!.slug}
                              onChange={(e) => setEditState((prev) => prev ? ({ ...prev, slug: e.target.value }) : prev)}
                              className="w-full px-3 py-1.5 border border-green-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <code className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                              {cat.slug}
                            </code>
                          )}
                        </td>

                        {/* Sort Order */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editState!.sortOrder}
                              onChange={(e) => setEditState((prev) => prev ? ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }) : prev)}
                              className="w-20 px-3 py-1.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                              min={1}
                            />
                          ) : (
                            <span className="text-gray-500 font-mono text-xs">{cat.sortOrder}</span>
                          )}
                        </td>

                        {/* Website Status toggle */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() => setEditState((prev) => prev ? ({ ...prev, isActive: !prev.isActive }) : prev)}
                              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${editState!.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                              <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${editState!.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          ) : (
                            <button
                              disabled={!canEdit}
                              onClick={() => handleToggleActive(cat)}
                              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${cat.isActive ? 'bg-green-500' : 'bg-gray-300'} ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
                              title={cat.isActive ? 'Click to hide from website' : 'Click to show on website'}
                            >
                              <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${cat.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="px-3 py-1 bg-green-700 text-white hover:bg-green-800 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 flex items-center gap-1"
                              >
                                {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✓'} Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              {canEdit ? (
                                <>
                                  <button
                                    onClick={() => startEdit(cat)}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTrigger(cat)}
                                    className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Read Only</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span>Active — visible to customers in navbar &amp; filters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
            <span>Inactive — hidden from customers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-600">Sort Order</span>
            <span>— lower numbers appear first</span>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products in this category will not be deleted, but will no longer be associated with any category.`}
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
