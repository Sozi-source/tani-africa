// app/(app)/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/lib/hooks/useAdmin';
import { User } from '@/types';
import { Users, Search, Shield, Truck, UserCircle, MoreVertical, CheckCircle, XCircle, Trash2, ChevronDown, RefreshCw, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const RoleBadge = ({ role }: { role: string }) => {
  const config: Record<string, { label: string; classes: string }> = {
    ADMIN: { label: 'Admin', classes: 'bg-gray-900 text-white' },
    DRIVER: { label: 'Driver', classes: 'bg-blue-100 text-blue-800' },
    CLIENT: { label: 'Client', classes: 'bg-green-100 text-green-800' },
  };
  const cfg = config[role] || { label: role, classes: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.classes}`}>{cfg.label}</span>;
};

const StatusBadge = ({ isActive }: { isActive: boolean | undefined }) => {
  // Provide default value of false if undefined
  const active = isActive === true;
  
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
      Inactive
    </span>
  );
};

export default function AdminUsersPage() {
  const { users, loading, error, searchTerm, setSearchTerm, updateUserRole, updateUserStatus, deleteUser, refetch } = useAdminUsers();
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && u.isActive) || (statusFilter === 'INACTIVE' && !u.isActive);
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
  const totalDrivers = users.filter(u => u.role === 'DRIVER').length;
  const totalClients = users.filter(u => u.role === 'CLIENT').length;

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">User Management</h1><p className="text-sm text-gray-500">{users.length} registered users</p></div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 shadow-sm"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold">{users.length}</p></div>
          <div className="bg-white rounded-xl p-3 shadow-sm"><p className="text-xs text-gray-500">Clients</p><p className="text-xl font-bold text-green-600">{totalClients}</p></div>
          <div className="bg-white rounded-xl p-3 shadow-sm"><p className="text-xs text-gray-500">Drivers</p><p className="text-xl font-bold text-blue-600">{totalDrivers}</p></div>
          <div className="bg-white rounded-xl p-3 shadow-sm"><p className="text-xs text-gray-500">Admins</p><p className="text-xl font-bold text-gray-800">{totalAdmins}</p></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200"><option value="ALL">All Roles</option><option value="CLIENT">Client</option><option value="DRIVER">Driver</option><option value="ADMIN">Admin</option></select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200"><option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
          <button onClick={refetch} className="px-3 py-2 bg-gray-100 rounded-lg"><RefreshCw className="h-4 w-4" /></button>
        </div>

        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${u.role === 'ADMIN' ? 'from-gray-600 to-gray-800' : u.role === 'DRIVER' ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'}`}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
                  <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{u.firstName} {u.lastName}</p><RoleBadge role={u.role} /><StatusBadge isActive={u.isActive} /></div><div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500"><div className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</div>{u.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{u.phone}</div>}<div className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {new Date(u.createdAt).toLocaleDateString()}</div></div></div>
                </div>
                <div className="relative"><button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)} className="p-1 rounded hover:bg-gray-100"><MoreVertical className="h-5 w-5 text-gray-400" /></button>{openMenu === u.id && (<div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10 py-1"><div className="px-3 py-1 text-xs font-semibold text-gray-400">Change Role</div>{['CLIENT', 'DRIVER', 'ADMIN'].map(role => (<button key={role} onClick={() => { updateUserRole(u.id, role); setOpenMenu(null); }} disabled={u.role === role} className="w-full text-left px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50">{role}</button>))}<div className="border-t my-1"></div><button onClick={() => { updateUserStatus(u.id, !u.isActive); setOpenMenu(null); }} className="w-full text-left px-3 py-1 text-sm">{u.isActive ? 'Deactivate' : 'Activate'}</button><div className="border-t my-1"></div><button onClick={() => { if(confirm('Delete user?')) deleteUser(u.id); setOpenMenu(null); }} className="w-full text-left px-3 py-1 text-sm text-red-600">Delete</button></div>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}