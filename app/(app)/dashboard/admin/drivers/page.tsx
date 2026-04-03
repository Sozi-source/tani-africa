'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, Phone, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type PendingDriver = {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    drivingLicense?: string;
    photo?: string;
    createdAt: string;
  };
  licenseNumber: string;
  vehicleType?: string;
  experienceYears?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  notes?: string;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching drivers...');
      const data = await adminAPI.getPendingDrivers();
      
      console.log('Drivers data received:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Ensure data is an array
      const driversArray = Array.isArray(data) ? data : [];
      setDrivers(driversArray);
      
      if (driversArray.length === 0) {
        console.log('No drivers found in response');
      }
      
    } catch (error: any) {
      console.error('Failed to fetch drivers - Full error:', error);
      
      // Check for response status
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        setStatusCode(error.response.status);
        
        if (error.response.status === 401) {
          setError('Not authenticated. Please log in as admin.');
        } else if (error.response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(error.response.data?.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        setError('No response from server. Is the backend running?');
      } else {
        setError(error?.message || 'Failed to load drivers');
      }
      
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, driverId: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span 
            key={`status-${driverId}-pending`}
            className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
          >
            📝 Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span 
            key={`status-${driverId}-approved`}
            className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
          >
            ✅ Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span 
            key={`status-${driverId}-rejected`}
            className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
          >
            ❌ Rejected
          </span>
        );
      default:
        return (
          <span 
            key={`status-${driverId}-default`}
            className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
          >
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="rounded-lg bg-red-50 p-6 sm:p-8 text-center">
          <XCircle className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 text-red-500" />
          <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
          {statusCode && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Status code: {statusCode}</p>
          )}
          <button
            onClick={fetchDrivers}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm sm:text-base text-white hover:bg-primary-700 transition-colors"
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
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Driver Applications
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Review and manage driver applications
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Total: {drivers.length} application{drivers.length !== 1 ? 's' : ''}
            </p>
          </div>

          {drivers.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 sm:p-12 text-center">
              <Shield className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <p className="text-sm sm:text-base text-gray-500">No driver applications found</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                When clients apply to become drivers, they'll appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {drivers.map((driver) => {
                // Ensure we have a valid unique key
                const uniqueKey = driver.id || driver.userId || `driver-${Date.now()}-${Math.random()}`;
                
                return (
                  <Card key={uniqueKey} hover>
                    <CardBody className="p-4 sm:p-5 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        
                        {/* Left side - Driver Info */}
                        <div className="flex-1 min-w-0">
                          {/* Status Badges Row */}
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            {getStatusBadge(driver.status, uniqueKey)}
                            <span className="text-xs text-gray-500">
                              Applied: {new Date(driver.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Driver Name */}
                          <h3 className="mb-2 text-base sm:text-lg md:text-xl font-semibold text-gray-900 break-words">
                            {driver.user.firstName} {driver.user.lastName}
                          </h3>
                          
                          {/* Driver Details */}
                          <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                              <span className="break-all">{driver.user.email}</span>
                            </div>
                            
                            {driver.user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                <span>{driver.user.phone}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                              <span className="break-all">License: {driver.licenseNumber}</span>
                            </div>
                            
                            {driver.vehicleType && (
                              <div className="text-xs text-gray-500 pl-6">
                                Vehicle: {driver.vehicleType}
                              </div>
                            )}
                            
                            {driver.experienceYears && (
                              <div className="text-xs text-gray-500 pl-6">
                                Experience: {driver.experienceYears} year{driver.experienceYears !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Right side - Action Buttons */}
                        <div className="flex gap-2 self-start lg:self-auto">
                          <Link href={`/admin/drivers/${driver.userId}`}>
                            <button
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span>View Details</span>
                            </button>
                          </Link>
                        </div>
                        
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RoleBasedRoute>
  );
}