'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/lib/hooks/useAdmin';
import { User } from '@/types';
import {
  Users,
  Search,
  Shield,
  Truck,
  UserCircle,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  RefreshCw,
  Filter,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Role badge
// ─────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; classes: string; icon: any }> = {
    ADMIN:  { label: 'Admin',  classes: 'bg-gray-900 text-white',          icon: Shield },
    DRIVER: { label: 'Driver', classes: 'bg-green-100 text-green-800',     icon: Truck },
    CLIENT: { label: 'Client', classes: 'bg-blue-100 text-blue-800',       icon: UserCircle },
  };
  const cfg = config[role] ?? { label: role, classes: 'bg-gray-100 text-gray-600', icon: UserCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────
function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 ring-1 ring-red-200">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
      Inactive
    </span>
  );
}

// ─────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────
function Avatar({ user }: { user: User }) {
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  const colors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-emerald-600',
    'from-purple-400 to-purple-600',
    'from-orange-400 to-red-500',
    'from-teal-400 to-cyan-600',
  ];
  const color = colors[(user.firstName?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────
// Actions dropdown
// ─────────────────────────────────────────────
function ActionsMenu({
  user,
  onRoleChange,
  onStatusToggle,
  onDelete,
}: {
  user: User;
  onRoleChange: (role: string) => void;
  onStatusToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
            {/* Role submenu */}
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Change Role
            </div>
            {['CLIENT', 'DRIVER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => { onRoleChange(role); setOpen(false); }}
                disabled={user.role === role}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RoleBadge role={role} />
                {user.role === role && <span className="ml-auto text-xs text-gray-400">current</span>}
              </button>
            ))}

            <div className="my-1 border-t border-gray-100" />

            {/* Toggle status */}
            <button
              onClick={() => { onStatusToggle(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {user.isActive ? (
                <><XCircle className="h-4 w-4 text-orange-500" /> Deactivate User</>
              ) : (
                <><CheckCircle className="h-4 w-4 text-emerald-500" /> Activate User</>
              )}
            </button>

            <div className="my-1 border-t border-gray-100" />

            {/* Delete */}
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Confirm dialog
// ─────────────────────────────────────────────
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function AdminUsersPage() {
  const {
    users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    refetch,
  } = useAdminUsers();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [confirm, setConfirm] = useState<null | {
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  }>(null);

  // Derived stats
  const totalAdmins  = users.filter((u) => u.role === 'ADMIN').length;
  const totalDrivers = users.filter((u) => u.role === 'DRIVER').length;
  const totalClients = users.filter((u) => u.role === 'CLIENT').length;
  const totalActive  = users.filter((u) => u.isActive).length;

  // Filtered list
  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL'
      || (statusFilter === 'ACTIVE' && u.isActive)
      || (statusFilter === 'INACTIVE' && !u.isActive);
    return matchRole && matchStatus;
  });

  const handleRoleChange = (user: User, role: string) => {
    setConfirm({
      title: 'Change Role',
      message: `Change ${user.firstName} ${user.lastName}'s role to ${role}?`,
      confirmLabel: 'Change Role',
      onConfirm: async () => {
        await updateUserRole(user.id, role);
        setConfirm(null);
      },
    });
  };

  const handleStatusToggle = (user: User) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    setConfirm({
      title: user.isActive ? 'Deactivate User' : 'Activate User',
      message: `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
      confirmLabel: user.isActive ? 'Deactivate' : 'Activate',
      danger: user.isActive,
      onConfirm: async () => {
        await updateUserStatus(user.id, !user.isActive);
        setConfirm(null);
      },
    });
  };

  const handleDelete = (user: User) => {
    setConfirm({
      title: 'Delete User',
      message: `This will permanently delete ${user.firstName} ${user.lastName} and all their data. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        await deleteUser(user.id);
        setConfirm(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
              Admin
            </div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              {users.length} registered user{users.length !== 1 ? 's' : ''} on the platform
            </p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users"  value={users.length}  icon={Users}      accent="bg-gray-800" />
          <StatCard label="Clients"      value={totalClients}  icon={UserCircle} accent="bg-blue-500" />
          <StatCard label="Drivers"      value={totalDrivers}  icon={Truck}      accent="bg-green-500" />
          <StatCard label="Active"        value={totalActive}   icon={CheckCircle} accent="bg-emerald-500" />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Role filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm text-gray-700 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="ALL">All Roles</option>
              <option value="CLIENT">Client</option>
              <option value="DRIVER">Driver</option>
              <option value="ADMIN">Admin</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-8 text-sm text-gray-700 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
              <p className="text-sm text-gray-500">Failed to load users. <button onClick={refetch} className="text-gray-900 underline">Try again</button></p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">No users match your filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((user) => (
                      <tr key={user.id} className="group transition hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge isActive={user.isActive ?? true} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.phone || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-KE', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : <span className="text-gray-300">—</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionsMenu
                            user={user}
                            onRoleChange={(role) => handleRoleChange(user, role)}
                            onStatusToggle={() => handleStatusToggle(user)}
                            onDelete={() => handleDelete(user)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filtered.map((user) => (
                  <div key={user.id} className="flex items-start justify-between p-4">
                    <div className="flex items-start gap-3">
                      <Avatar user={user} />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <RoleBadge role={user.role} />
                          <StatusBadge isActive={user.isActive ?? true} />
                        </div>
                      </div>
                    </div>
                    <ActionsMenu
                      user={user}
                      onRoleChange={(role) => handleRoleChange(user, role)}
                      onStatusToggle={() => handleStatusToggle(user)}
                      onDelete={() => handleDelete(user)}
                    />
                  </div>
                ))}
              </div>

              {/* Footer count */}
              <div className="border-t border-gray-100 px-6 py-3">
                <p className="text-xs text-gray-400">
                  Showing <strong className="text-gray-700">{filtered.length}</strong> of <strong className="text-gray-700">{users.length}</strong> users
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}