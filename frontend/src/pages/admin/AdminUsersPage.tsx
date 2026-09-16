import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useAuth } from '../../hooks/useAuth';
import type { User, UserRole } from '../../types/user';

interface AdminUsersPageProps {
  defaultTab?: 'users' | 'admins' | 'all';
}

const MENU_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: '🖥️' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'categories', label: 'Categories', icon: '📂' },
  { key: 'orders', label: 'Orders', icon: '🛒' },
  { key: 'users', label: 'User Management', icon: '👤' },
  { key: 'admins', label: 'Admin Management', icon: '🛡️' },
  { key: 'profile', label: 'Profile Settings', icon: '⚙️' },
];

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ defaultTab = 'users' }) => {
  const { users, currentUser, isSuperAdmin, deleteUser, updateUserRole, updateUserPermissions } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'admins' | 'all'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Permission Modal state
  const [userForPermissions, setUserForPermissions] = useState<User | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const isAdminView = activeTab === 'admins';

  const filteredUsers = users.filter((u) => {
    // Role filter based on active view mode
    if (isAdminView) {
      if (u.role !== 'admin' && u.role !== 'superadmin') return false;
    } else {
      if (u.role !== 'user') return false;
    }

    // Search query filter
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.phone && u.phone.includes(query)) ||
      u.role.toLowerCase().includes(query)
    );
  });

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const result = await deleteUser(userToDelete.id);
      if (!result.success) {
        setActionError(result.error || 'Failed to delete account.');
      } else {
        setActionError(null);
        setActionSuccess(`Account ${userToDelete.name} (${userToDelete.email}) deleted successfully.`);
      }
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    if (user.role === newRole) return;
    const result = await updateUserRole(user.id, newRole);
    if (!result.success) {
      setActionError(result.error || 'Failed to change user role.');
      setActionSuccess(null);
    } else {
      setActionError(null);
      setActionSuccess(`Role for ${user.name} (${user.email}) updated to ${newRole.toUpperCase()}`);
    }
  };

  const handleOpenPermissionsModal = (user: User) => {
    setUserForPermissions(user);
    const existing = user.permissions && user.permissions.length > 0
      ? user.permissions
      : MENU_OPTIONS.map((m) => m.key);
    setSelectedPermissions(existing);
  };

  const handleTogglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async () => {
    if (!userForPermissions) return;
    const result = await updateUserPermissions(userForPermissions.id, selectedPermissions);
    if (!result.success) {
      setActionError(result.error || 'Failed to update menu permissions.');
      setActionSuccess(null);
    } else {
      setActionError(null);
      setActionSuccess(`Menu permissions for ${userForPermissions.name} updated successfully.`);
    }
    setUserForPermissions(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-purple-50 text-purple-900 border-purple-300 shadow-2xs">
            ⚡ SUPERADMIN
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-300">
            🛡️ ADMIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
            👤 USER
          </span>
        );
    }
  };

  const pageTitle = isAdminView ? 'Admin Management' : 'User Management';

  return (
    <AdminLayout title={pageTitle}>
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{pageTitle}</span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">
                {filteredUsers.length} {isAdminView ? 'Admin Accounts' : 'Registered Users'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {isAdminView
                ? 'Manage administrator accounts, Superadmin credentials & left menu permissions.'
                : 'View customer accounts, user Gmail addresses & manage permissions.'}
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder={isAdminView ? "Search Admin Gmail, name..." : "Search User Gmail, name..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A000]/30"
            />
          </div>
        </div>
      </div>

      {/* Action Error Notice */}
      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>⚠️ {actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-800 font-extrabold px-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Action Success Notice */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>✅ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-800 font-extrabold px-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Users / Admins Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                <th className="py-3 px-4">Account Holder</th>
                <th className="py-3 px-4">{isAdminView ? 'Admin Gmail / Email' : 'User Gmail / Email'}</th>
                <th className="py-3 px-4">Role</th>
                {isAdminView && <th className="py-3 px-4">Accessible Left Menus</th>}
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  const isUserSuperAdmin = user.role === 'superadmin';
                  const isUserAdmin = user.role === 'admin' || isUserSuperAdmin;

                  const perms = isUserSuperAdmin
                    ? MENU_OPTIONS.map((m) => m.label)
                    : user.permissions && user.permissions.length > 0
                    ? MENU_OPTIONS.filter((m) => user.permissions?.includes(m.key)).map((m) => m.label)
                    : ['All Menus'];

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${
                              isUserSuperAdmin
                                ? 'bg-purple-950 text-amber-300 border border-purple-400'
                                : user.role === 'admin'
                                ? 'bg-[#0B1B2E] text-amber-400 border border-amber-400/60'
                                : 'bg-slate-800 text-white border border-slate-300'
                            } flex items-center justify-center font-extrabold text-xs shrink-0`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{user.phone || `ID: ${user.id}`}</span>
                          </div>
                        </div>
                      </td>

                      {/* Gmail / Email Address Badge */}
                      <td className="py-3 px-4 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold">✉️</span>
                          <span className="font-mono text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80">
                            {user.email}
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>

                      {/* Accessible Menus (Admin View Only) */}
                      {isAdminView && (
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {isUserSuperAdmin ? (
                              <span className="text-[10px] font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                                ⚡ Full Access (All Menus)
                              </span>
                            ) : (
                              perms.map((p) => (
                                <span
                                  key={p}
                                  className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded"
                                >
                                  {p}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      )}

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Manage Menu Permissions Button for Admins */}
                          {isAdminView && isUserAdmin && (
                            <button
                              type="button"
                              onClick={() => handleOpenPermissionsModal(user)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>🔑 Menu Access</span>
                            </button>
                          )}

                          {/* Role Selector */}
                          {isSuperAdmin ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                              disabled={isCurrent && isUserSuperAdmin}
                              className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="superadmin">Superadmin</option>
                            </select>
                          ) : (
                            !isUserSuperAdmin && (
                              <button
                                onClick={() =>
                                  handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')
                                }
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                              >
                                {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              </button>
                            )
                          )}

                          {/* Delete Account */}
                          {!isCurrent && !isUserSuperAdmin && (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdminView ? 6 : 5} className="py-12 text-center text-slate-400 font-medium">
                    No {isAdminView ? 'admin' : 'user'} accounts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Modal */}
      {userForPermissions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in space-y-5 p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🔑 Menu Access Permissions</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose which left sidebar menu items are accessible to{' '}
                  <strong className="text-slate-900">{userForPermissions.name}</strong> ({userForPermissions.email}).
                </p>
              </div>
              <button
                onClick={() => setUserForPermissions(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Select All / Deselect All */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Selected Menus: {selectedPermissions.length} / {MENU_OPTIONS.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPermissions(MENU_OPTIONS.map((m) => m.key))}
                  className="text-[#F5A000] hover:text-amber-600 font-bold"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedPermissions([])}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Permissions Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
              {MENU_OPTIONS.map((option) => {
                const isChecked = selectedPermissions.includes(option.key);
                return (
                  <label
                    key={option.key}
                    onClick={() => handleTogglePermission(option.key)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#F5A000] focus:ring-[#F5A000]/20 accent-[#F5A000] cursor-pointer"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserForPermissions(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 bg-[#F5A000] hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Delete Account"
        message={`Are you sure you want to delete account "${userToDelete?.name}" (${userToDelete?.email})?`}
        confirmText="Delete Account"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setUserToDelete(null)}
      />
    </AdminLayout>
  );
};

export default AdminUsersPage;
