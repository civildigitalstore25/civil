import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageToolbar from '../../components/admin/AdminPageToolbar';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useAuth } from '../../hooks/useAuth';
import type { User, UserRole } from '../../types/user';
import { downloadExcel, downloadJson, exportDateStamp } from '../../utils/adminExport';

interface AdminUsersPageProps {
  defaultTab?: 'users' | 'admins' | 'all';
}

const MENU_OPTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Products' },
  { key: 'draft-products', label: 'Draft Products' },
  { key: 'banners', label: 'Homepage Banners' },
  { key: 'categories', label: 'Brands & Categories' },
  { key: 'orders', label: 'Orders' },
  { key: 'users', label: 'User Management' },
  { key: 'admins', label: 'Admin Management' },
  { key: 'profile', label: 'Profile Settings' },
];

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ defaultTab = 'users' }) => {
  const { users, currentUser, isSuperAdmin, deleteUser, updateUserRole, updateUserPermissions } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'admins' | 'all'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Permission Modal state
  const [userForPermissions, setUserForPermissions] = useState<User | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
    setRoleFilter('All');
  }, [defaultTab]);

  const isAdminView = activeTab === 'admins';

  const filteredUsers = users.filter((u) => {
    // Role filter based on active view mode
    if (isAdminView) {
      if (u.role !== 'admin' && u.role !== 'superadmin') return false;
    } else {
      if (u.role !== 'user') return false;
    }

    if (roleFilter !== 'All' && u.role !== roleFilter) return false;

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
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-300">
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
            User
          </span>
        );
    }
  };

  const pageTitle = isAdminView ? 'Admin accounts' : 'Users';
  const userExportRows = filteredUsers.map((user) => ({
    Name: user.name,
    Email: user.email,
    Phone: user.phone || '',
    Role: user.role,
    Permissions: user.permissions?.join(', ') || '',
    Joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : '',
  }));

  return (
    <AdminLayout title={pageTitle}>
      <AdminPageToolbar
        title={pageTitle}
        description={isAdminView ? 'Search administrators and export the current list.' : 'Search customers and export the current list.'}
        count={filteredUsers.length}
        countLabel={isAdminView ? 'admins' : 'users'}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search name, email, or phone"
        filters={[
          {
            id: 'role',
            ariaLabel: 'Filter by role',
            value: roleFilter,
            onChange: setRoleFilter,
            options: isAdminView
              ? [
                  { value: 'All', label: 'All roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'superadmin', label: 'Super admin' },
                ]
              : [
                  { value: 'All', label: 'All roles' },
                  { value: 'user', label: 'User' },
                ],
          },
        ]}
        onClear={() => {
          setSearchQuery('');
          setRoleFilter('All');
        }}
        onExportExcel={() => downloadExcel(userExportRows, isAdminView ? 'Admins' : 'Users', `${isAdminView ? 'admins' : 'users'}_${exportDateStamp()}`)}
        onExportJson={() => downloadJson(userExportRows, `${isAdminView ? 'admins' : 'users'}_${exportDateStamp()}`)}
      />

      {actionError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="cursor-pointer p-1 text-rose-800" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="cursor-pointer p-1 text-emerald-800" aria-label="Dismiss">
            <X className="h-4 w-4" />
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
                        <span className="font-mono text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80">
                          {user.email}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">{getRoleBadge(user.role)}</td>

                      {/* Accessible Menus (Admin View Only) */}
                      {isAdminView && (
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {isUserSuperAdmin ? (
                              <span className="text-[10px] font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md">
                                Full access
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
                              Menu access
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
                  Menu access
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose which left sidebar menu items are accessible to{' '}
                  <strong className="text-slate-900">{userForPermissions.name}</strong> ({userForPermissions.email}).
                </p>
              </div>
              <button
                onClick={() => setUserForPermissions(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
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
                    <span className="text-xs">{option.label}</span>
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
