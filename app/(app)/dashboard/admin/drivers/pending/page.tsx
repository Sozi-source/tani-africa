// app/(app)/admin/drivers/pending/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Eye, Mail, Phone, Shield, Truck, Clock, CheckCircle, 
  XCircle, UserCheck, Calendar, FileText, Search, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ✅ Define the driver type for the component
interface Driver {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    drivingLicense?: string | null;
  };
  licenseNumber: string;
  vehicleType?: string;
  experienceYears?: number;
  status: string;
  appliedAt: string;
}

export default function PendingDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => { 
    fetchDrivers(); 
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminAPI.getPendingDrivers();
      console.log('Raw response data:', data);
      
      const mappedDrivers: Driver[] = [];
      
      if (Array.isArray(data)) {
        for (const item of data) {
          // Handle both possible response structures
          const userId = (item as any).userId || (item as any).id;
          const userData = (item as any).user || item;
          const applicationData = (item as any).application || (item as any).driverApplication || {};
          
          mappedDrivers.push({
            id: userId,
            userId: userId,
            user: {
              firstName: userData?.firstName || '',
              lastName: userData?.lastName || '',
              email: userData?.email || '',
              phone: userData?.phone,
              drivingLicense: userData?.drivingLicense,
            },
            licenseNumber: applicationData?.licenseNumber || (item as any).licenseNumber || 'Not provided',
            vehicleType: applicationData?.vehicleType || (item as any).vehicleType,
            experienceYears: applicationData?.experienceYears || (item as any).experienceYears,
            status: (item as any).status || 'PENDING',
            appliedAt: (item as any).submittedAt || (item as any).appliedAt || new Date().toISOString(),
          });
        }
      }
      
      console.log('Mapped drivers:', mappedDrivers);
      setDrivers(mappedDrivers);
    } catch (err: any) {
      console.error('Fetch error details:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load drivers');
      toast.error('Failed to load drivers');
    } finally { 
      setLoading(false); 
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      console.log('Approving driver:', userId);
      await adminAPI.approveDriver(userId);
      toast.success('Driver approved successfully');
      await fetchDrivers();
    } catch (err: any) {
      console.error('Approve error details:', err);
      toast.error(err?.response?.data?.message || 'Failed to approve driver');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedDriver) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setProcessingId(selectedDriver.userId);
    try {
      console.log('Rejecting driver:', selectedDriver.userId, rejectionReason);
      await adminAPI.rejectDriver(selectedDriver.userId, rejectionReason);
      toast.success('Driver rejected');
      setShowRejectModal(false);
      setSelectedDriver(null);
      setRejectionReason('');
      await fetchDrivers();
    } catch (err: any) {
      console.error('Reject error details:', err);
      toast.error(err?.response?.data?.message || 'Failed to reject driver');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = searchTerm === '' || 
      `${driver.user?.firstName} ${driver.user?.lastName} ${driver.user?.email} ${driver.licenseNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <p className="text-red-500 font-medium">{error}</p>
          <button 
            onClick={fetchDrivers} 
            className="mt-4 px-4 py-2 bg-maroon-600 text-white rounded-lg hover:bg-maroon-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Driver Approvals</h1>
            <p className="text-sm text-gray-500 mt-1">Review and manage driver applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-maroon-500 shadow-sm">
              <Clock className="h-5 w-5 text-maroon-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{drivers.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-green-500 shadow-sm">
              <UserCheck className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs sm:text-sm text-gray-500">Approved</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-teal-500 shadow-sm">
              <Shield className="h-5 w-5 text-teal-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{drivers.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-maroon-500 focus:outline-none focus:ring-2 focus:ring-maroon-500/20"
              />
            </div>
          </div>

          {/* Results */}
          {filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No pending driver applications</p>
              <p className="text-sm text-gray-400 mt-1">All caught up! Check back later.</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  Showing {filteredDrivers.length} of {drivers.length} applications
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {filteredDrivers.map((driver) => (
                  <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 sm:p-5">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-maroon-100 rounded-full flex items-center justify-center">
                            <Truck className="h-6 w-6 sm:h-7 sm:w-7 text-maroon-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {driver.user?.firstName} {driver.user?.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">{driver.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                          <span className="text-xs text-gray-400">
                            Applied: {new Date(driver.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{driver.user?.email}</span>
                        </div>
                        {driver.user?.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{driver.user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">License: {driver.licenseNumber}</span>
                        </div>
                        {driver.experienceYears && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>{driver.experienceYears} years experience</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                        <Link href={`/dashboard/admin/drivers/${driver.userId}`} className="flex-1">
                          <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </Link>
                        <button
                          onClick={() => handleRejectClick(driver)}
                          disabled={processingId === driver.userId}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(driver.userId)}
                          disabled={processingId === driver.userId}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-maroon-600 text-white rounded-lg text-sm font-medium hover:bg-maroon-700 transition-colors disabled:opacity-50"
                        >
                          {processingId === driver.userId ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Driver Application</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject <strong>{selectedDriver.user?.firstName} {selectedDriver.user?.lastName}</strong>'s application?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for rejection
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-maroon-500 focus:outline-none focus:ring-2 focus:ring-maroon-500/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedDriver(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim() || processingId === selectedDriver.userId}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {processingId === selectedDriver.userId ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleBasedRoute>
  );
}