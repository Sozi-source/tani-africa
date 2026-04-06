'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';
import { JobTrackingMap } from '@/components/JobTracker/JobTrackingMap';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Package, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params.id as string;
  const { getJobById, loading } = useJobs();
  
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    setIsLoading(true);
    try {
      const jobData = await getJobById(jobId);
      if (!jobData) {
        setError('Job not found');
      } else {
        setJob(jobData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load job');
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'Unable to load tracking information'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Only client who created the job or driver can track
  if (job.clientId !== user?.id && job.driverId !== user?.id && user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">You don't have permission to track this job</p>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Track Your Shipment
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time location updates for {job.title || 'Job #' + job.id.slice(-8)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">Live Tracking Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Map */}
        <JobTrackingMap
          jobId={job.id}
          pickUpLocation={{
            lat: job.pickUpLatitude || -1.2921,
            lng: job.pickUpLongitude || 36.8219,
            address: job.pickUpLocation,
          }}
          dropOffLocation={{
            lat: job.dropOffLatitude || -1.2921,
            lng: job.dropOffLongitude || 36.8219,
            address: job.dropOffLocation,
          }}
          driverName={job.driver?.firstName ? `${job.driver.firstName} ${job.driver.lastName}` : undefined}
          driverPhone={job.driver?.phone}
          driverRating={job.driver?.rating}
        />
      </div>
    </div>
  );
}