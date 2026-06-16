'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from 'firebase/auth';


import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  getAdminUsers,
  getRoles,
  saveRole,
  saveStaffUser,
  updateStaffUser,
  deleteStaffUser,
  deleteRole,
} from '../../lib/firestore';
import type { AdminUser, Role, RolePermissions } from '../../../shared/types';

const PERMISSION_GROUPS = [
  {
    title: 'Dashboard',
    permissions: [
      { key: 'dashboard_view', label: 'View Dashboard Stats', desc: 'Allows viewing general dashboard statistics.' },
      { key: 'dashboard_export_analytics', label: 'Export Analytics & Reports', desc: 'Allows exporting sales analytics.' },
    ],
  },
  {
    title: 'Orders',
    permissions: [
      { key: 'orders_view', label: 'View Orders List', desc: 'Allows viewing the orders list and details.' },
      { key: 'orders_edit', label: 'Edit Order Notes', desc: 'Allows editing notes/details on active orders.' },
      { key: 'orders_update_status', label: 'Update Status', desc: 'Allows moving order fulfillment status.' },
      { key: 'orders_refund', label: 'Refund Orders', desc: 'Allows processing cancellations and refunds.' },
      { key: 'orders_delivery_queue', label: 'Delivery Driver Access', desc: 'Allows access to delivery queue assignment.' },
    ],
  },
  {
    title: 'Products & Categories',
    permissions: [
      { key: 'menu_view', label: 'View Products & Categories', desc: 'Allows reading products and categories.' },
      { key: 'menu_edit', label: 'Manage Menu items', desc: 'Allows adding, editing, or deleting products/categories.' },
      { key: 'menu_toggle_stock', label: 'Toggle Stock Status', desc: 'Allows marking items as in or out of stock.' },
    ],
  },
  {
    title: 'Customers',
    permissions: [
      { key: 'customers_view', label: 'View Customer Database', desc: 'Allows viewing customer records and metrics.' },
      { key: 'customers_edit', label: 'Edit Customer profiles', desc: 'Allows writing admin notes or editing profile details.' },
    ],
  },
  {
    title: 'Coupons',
    permissions: [
      { key: 'coupons_manage', label: 'Manage Coupons', desc: 'Allows creating, editing, and deleting discount codes.' },
    ],
  },
  {
    title: 'Settings',
    permissions: [
      { key: 'settings_manage', label: 'Manage Global Settings', desc: 'Allows editing business contact, shipping rates, and pixel IDs.' },
    ],
  },
  {
    title: 'Staff & Roles',
    permissions: [
      { key: 'staff_manage', label: 'Manage Staff & Roles', desc: 'Allows creating staff accounts and managing permissions.' },
    ],
  },
];

const DEFAULT_PERMISSIONS: RolePermissions = {
  dashboard_view: false,
  dashboard_export_analytics: false,
  orders_view: false,
  orders_edit: false,
  orders_update_status: false,
  orders_refund: false,
  orders_delivery_queue: false,
  menu_view: false,
  menu_edit: false,
  menu_toggle_stock: false,
  customers_view: false,
  customers_edit: false,
  coupons_manage: false,
  settings_manage: false,
  staff_manage: false,
};

export default function StaffPage() {
  const { adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>('staff');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // New staff form state
  const [staffForm, setStaffForm] = useState({
    displayName: '',
    email: '',
    password: '',
    roleId: '',
    isActive: true,
  });
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // New/Edit role form state
  const [roleForm, setRoleForm] = useState<{
    id: string;
    name: string;
    description: string;
    permissions: RolePermissions;
    isEdit: boolean;
  }>({
    id: '',
    name: '',
    description: '',
    permissions: { ...DEFAULT_PERMISSIONS },
    isEdit: false,
  });
  const [submittingRole, setSubmittingRole] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([getAdminUsers(), getRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Staff action: Toggle active status
  const handleToggleStaffStatus = async (user: AdminUser) => {
    try {
      const updatedStatus = !user.isActive;
      await updateStaffUser(user.uid, { isActive: updatedStatus });
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, isActive: updatedStatus } : u))
      );
      toast.success(`${user.displayName} account is now ${updatedStatus ? 'Active' : 'Inactive'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Staff action: Update Role
  const handleUpdateStaffRole = async (uid: string, roleId: string) => {
    try {
      await updateStaffUser(uid, { roleId });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, roleId } : u))
      );
      toast.success('Staff role updated successfully');
    } catch {
      toast.error('Failed to update staff role');
    }
  };

  const handleDeleteStaff = async (uid: string, name: string) => {
    if (uid === adminUser?.uid) {
      toast.error('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete staff account for "${name}"? This cannot be undone.`)) return;
    try {
      await deleteStaffUser(uid);
      toast.success('Staff account deleted');
      loadData();
    } catch {
      toast.error('Failed to delete staff account');
    }
  };

  const handleDeleteRole = async (roleId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the role "${name}"? Staff assigned to this role will lose their custom permissions.`)) return;
    try {
      await deleteRole(roleId);
      toast.success('Role deleted');
      loadData();
    } catch {
      toast.error('Failed to delete role');
    }
  };

  // Staff creation: Use secondary app registration
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.displayName || !staffForm.email || !staffForm.password || !staffForm.roleId) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmittingStaff(true);

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const secondaryAppName = `temp-staff-app-${Date.now()}`;
    let secondaryApp;
    try {
      // 1. Create in Firebase Auth using secondary app instance
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        staffForm.email,
        staffForm.password
      );
      await secondarySignOut(secondaryAuth);

      // 2. Create user document in Firestore
      await saveStaffUser(cred.user.uid, {
        email: staffForm.email,
        displayName: staffForm.displayName,
        roleId: staffForm.roleId,
        isActive: staffForm.isActive,
      });

      toast.success('Staff member created successfully!');
      setStaffModalOpen(false);
      setStaffForm({ displayName: '', email: '', password: '', roleId: '', isActive: true });
      loadData();
    } catch (err: any) {
      console.error(err);
      let msg = 'Failed to create staff member.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      toast.error(msg);
    } finally {
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch {}
      }
      setSubmittingStaff(false);
    }
  };

  // Role action: Edit / Create Submit
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.id || !roleForm.name) {
      toast.error('Please enter Role ID and Name');
      return;
    }
    setSubmittingRole(true);
    try {
      const slugifiedId = roleForm.isEdit ? roleForm.id : roleForm.id.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      await saveRole(slugifiedId, {
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        isActive: true,
        isSystem: roleForm.isEdit ? roles.find((r) => r.id === roleForm.id)?.isSystem ?? false : false,
      });

      toast.success(`Role ${roleForm.isEdit ? 'updated' : 'created'} successfully!`);
      setRoleModalOpen(false);
      setRoleForm({ id: '', name: '', description: '', permissions: { ...DEFAULT_PERMISSIONS }, isEdit: false });
      loadData();
    } catch {
      toast.error('Failed to save role');
    } finally {
      setSubmittingRole(false);
    }
  };

  const openEditRoleModal = (role: Role) => {
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: {
        ...DEFAULT_PERMISSIONS,
        ...(role.permissions || {}),
      },
      isEdit: true,
    });
    setRoleModalOpen(true);
  };

  const handlePermissionChange = (key: keyof RolePermissions, checked: boolean) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: checked,
      },
    }));
  };

  // Safe names lookup
  const getRoleName = (roleId: string) => {
    if (roleId === 'super_admin') return 'Super Admin';
    return roles.find((r) => r.id === roleId)?.name ?? roleId;
  };

  return (
    <AdminLayout title="Staff & Roles" requiredPermission="staff_manage">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Staff & Roles</h2>
            <p className="text-sm text-gray-500 mt-1">Manage staff user logins and custom role definitions.</p>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'staff') {
                setStaffModalOpen(true);
              } else {
                setRoleForm({
                  id: '',
                  name: '',
                  description: '',
                  permissions: { ...DEFAULT_PERMISSIONS },
                  isEdit: false,
                });
                setRoleModalOpen(true);
              }
            }}
            className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 self-start"
          >
            {activeTab === 'staff' ? '➕ Add Staff Account' : '➕ Create Custom Role'}
          </button>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'staff' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            👥 Staff Accounts
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${activeTab === 'roles' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            🔑 Roles & Permissions
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'staff' && (
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((user) => (
                        <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-800">{user.displayName}</td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{user.email}</td>
                          <td className="px-6 py-4">
                            {user.roleId === 'super_admin' || user.role === 'super_admin' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                Super Admin
                              </span>
                            ) : (
                              <select
                                value={user.roleId || user.role || ''}
                                onChange={(e) => handleUpdateStaffRole(user.uid, e.target.value)}
                                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                              >
                                <option value="" disabled>Select Role...</option>
                                {roles.map((role) => (
                                  <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.roleId === 'super_admin' || user.role === 'super_admin' ? (
                              <span className="text-xs text-gray-400 italic">Always Active</span>
                            ) : (
                              <button
                                onClick={() => handleToggleStaffStatus(user)}
                                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                              >
                                <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${user.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.roleId === 'super_admin' || user.role === 'super_admin' || user.uid === adminUser?.uid ? (
                              <span className="text-xs text-gray-400 italic">Protected</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteStaff(user.uid, user.displayName)}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seed default visual card for Super Admin */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">Super Admin</h3>
                      <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">System Role</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Highest level access. Reserved for system owners and core administrators.</p>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-400 block mb-1">Key Permissions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded font-semibold border border-gray-100">Full Access (All Modules)</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-50 pt-4 mt-6 flex justify-end">
                    <span className="text-xs text-gray-400 italic">Protected System Role</span>
                  </div>
                </div>

                {roles.map((role) => (
                  <div key={role.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 relative flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">{role.name}</h3>
                        {role.isSystem && (
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">System Role</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{role.description || 'No description provided.'}</p>
                      <div>
                        <span className="text-xs font-bold text-gray-400 block mb-2">Enabled Permissions:</span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {Object.entries(role.permissions || {})
                            .filter(([_, enabled]) => enabled)
                            .map(([key]) => (
                              <span key={key} className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-100">
                                {key.replace(/_/g, ' ')}
                              </span>
                            ))}
                          {Object.values(role.permissions || {}).filter(Boolean).length === 0 && (
                            <span className="text-xs text-gray-400 italic">No permissions active.</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-50 pt-4 mt-6 flex justify-end gap-2">
                      <button
                        onClick={() => openEditRoleModal(role)}
                        className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
                      >
                        ⚙️ Edit Permissions
                      </button>
                      {!role.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-600 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Staff creation Modal */}
      {staffModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-lg">Add Staff Account</h3>
              <button onClick={() => setStaffModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.displayName}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role Assignment</label>
                <select
                  required
                  value={staffForm.roleId}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, roleId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="" disabled>Select Role...</option>
                  <option value="super_admin">Super Admin</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-3 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStaffForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${staffForm.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${staffForm.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700 font-semibold">Account Active</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStaff}
                  className="flex-1 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submittingStaff ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                  ) : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role configuration Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-shrink-0">
              <h3 className="font-bold text-gray-800 text-lg">{roleForm.isEdit ? 'Edit Role Permissions' : 'Create Custom Role'}</h3>
              <button onClick={() => setRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleRoleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role ID (Slug)</label>
                  <input
                    type="text"
                    required
                    disabled={roleForm.isEdit}
                    value={roleForm.id}
                    onChange={(e) => setRoleForm((prev) => ({ ...prev, id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="e.g. store_manager"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Store Manager"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <input
                    type="text"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Describe the operational scope of this role..."
                  />
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Module Permissions</h4>
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.title} className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-3">
                    <h5 className="font-bold text-xs text-gray-600 uppercase tracking-wider">{group.title}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {group.permissions.map((perm) => (
                        <label key={perm.key} className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!roleForm.permissions[perm.key as keyof RolePermissions]}
                            onChange={(e) => handlePermissionChange(perm.key as keyof RolePermissions, e.target.checked)}
                            className="mt-1 rounded text-green-700 focus:ring-green-500 w-4 h-4 border-gray-300"
                          />
                          <div>
                            <span className="text-sm font-semibold text-gray-700 block">{perm.label}</span>
                            <span className="text-xs text-gray-400 block mt-0.5">{perm.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </form>
            <div className="flex gap-2 pt-3 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRoleSubmit}
                disabled={submittingRole}
                className="flex-1 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submittingRole ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>
                ) : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
