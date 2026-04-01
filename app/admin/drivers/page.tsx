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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">📝 Pending</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">✅ Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">❌ Rejected</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="rounded-lg bg-red-50 p-8 text-center">
          <XCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
          <p className="text-red-600 font-medium">{error}</p>
          {statusCode && (
            <p className="text-sm text-gray-500 mt-1">Status code: {statusCode}</p>
          )}
          <button
            onClick={fetchDrivers}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Applications</h1>
          <p className="mt-2 text-gray-600">Review and manage driver applications</p>
          <p className="text-sm text-gray-400 mt-1">Total: {drivers.length} application{drivers.length !== 1 ? 's' : ''}</p>
        </div>

        {drivers.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Shield className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">No driver applications found</p>
            <p className="text-sm text-gray-400 mt-2">When clients apply to become drivers, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drivers.map((driver) => (
              <Card key={driver.id} hover>
                <CardBody className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        {getStatusBadge(driver.status)}
                        <span className="text-xs text-gray-500">
                          Applied: {new Date(driver.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        {driver.user.firstName} {driver.user.lastName}
                      </h3>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{driver.user.email}</span>
                        </div>
                        {driver.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{driver.user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span>License: {driver.licenseNumber}</span>
                        </div>
                        {driver.vehicleType && (
                          <div className="text-xs text-gray-500">
                            Vehicle: {driver.vehicleType}
                          </div>
                        )}
                        {driver.experienceYears && (
                          <div className="text-xs text-gray-500">
                            Experience: {driver.experienceYears} years
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/admin/drivers/${driver.userId}`}>
                        <button
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="mr-1 inline h-4 w-4" />
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleBasedRoute>
  );
}