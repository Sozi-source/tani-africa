// app/(app)/admin/drivers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, Mail, Phone, Shield, Truck, Clock, CheckCircle, XCircle, Calendar, MapPin, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PendingDriver {
  id: string;
  userId: string;
  user: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone?: string; 
    createdAt: string;
    drivingLicense?: string;
  };
  licenseNumber: string;
  vehicleType?: string;
  experienceYears?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  notes?: string;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingDrivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load drivers');
      toast.error('Failed to load drivers');
    } finally { setLoading(false); }
  };

  // Filter drivers based on search and status
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = searchTerm === '' || 
      `${driver.user.firstName} ${driver.user.lastName} ${driver.user.email} ${driver.licenseNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalPending = drivers.filter(d => d.status === 'PENDING').length;
  const totalApproved = drivers.filter(d => d.status === 'APPROVED').length;
  const totalRejected = drivers.filter(d => d.status === 'REJECTED').length;

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
      PENDING: { label: 'Pending Review', color: 'text-yellow-700', bgColor: 'bg-yellow-50', icon: Clock },
      APPROVED: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-50', icon: CheckCircle },
      REJECTED: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50', icon: XCircle },
    };
    const cfg = config[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-50', icon: Shield };
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-red-300 mb-3" />
        <p className="text-red-500">{error}</p>
        <button onClick={fetchDrivers} className="mt-3 text-orange-500 hover:underline">Try Again</button>
      </div>
    </div>
  );

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
          
          {/* Header Section - Mobile First */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Driver Applications</h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage driver applications</p>
          </div>

          {/* Stats Cards - Horizontal Scroll on Mobile, Grid on Desktop */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalPending}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalApproved}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Approved</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalRejected}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Rejected</p>
            </div>
          </div>

          {/* Search and Filter - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-orange-500 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-gray-500">
              Showing {filteredDrivers.length} of {drivers.length} applications
            </p>
          </div>

          {/* Drivers List - Mobile First Card Design */}
          {filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No driver applications found</p>
              <p className="text-sm text-gray-400 mt-1">When clients apply to become drivers, they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Mobile Card Design */}
                  <div className="p-4 sm:p-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Truck className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            {driver.user.firstName} {driver.user.lastName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{driver.user.email}</p>
                        </div>
                      </div>
                      <StatusBadge status={driver.status} />
                    </div>

                    {/* Details Grid - Mobile: Vertical, Desktop: Horizontal */}
                    <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{driver.user.email}</span>
                      </div>
                      {driver.user.phone && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                          <span>{driver.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span>Applied: {new Date(driver.appliedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">License: {driver.licenseNumber}</span>
                      </div>
                    </div>

                    {/* Additional Info Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {driver.experienceYears && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          {driver.experienceYears} yrs exp
                        </span>
                      )}
                      {driver.vehicleType && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          <Truck className="h-3 w-3" />
                          {driver.vehicleType}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link href={`/admin/users/${driver.userId}`}>
                      <button className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                        <Eye className="h-4 w-4" />
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Stats */}
          {filteredDrivers.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                Showing {filteredDrivers.length} of {drivers.length} driver applications
              </p>
            </div>
          )}
        </div>
      </div>
    </RoleBasedRoute>
  );
}