'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { JobCard } from '@/components/jobs/JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle, Plus, Search, Filter, ChevronRight } from 'lucide-react';

export default function MyJobsPage() {
  const { user } = useAuth();
  const { jobs, loading, error, fetchJobs } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchJobs();
  }, []);

  // Safety check - ensure jobs is an array
  const jobsArray = Array.isArray(jobs) ? jobs : [];
  
  // Filter jobs for the current user
  const myJobs = jobsArray.filter(job => job.clientId === user?.id);
  
  // Apply filters
  const filteredJobs = myJobs.filter(job => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(searchLower) ||
        job.pickUpLocation?.toLowerCase().includes(searchLower) ||
        job.dropOffLocation?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
    
    return true;
  });

  const activeJobs = myJobs.filter(job => 
    ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status)
  );
  const completedJobs = myJobs.filter(job => job.status === 'COMPLETED');
  const cancelledJobs = myJobs.filter(job => job.status === 'CANCELLED');

  const statusOptions = [
    { value: 'ALL', label: 'All', count: myJobs.length },
    { value: 'SUBMITTED', label: 'Pending', count: myJobs.filter(j => j.status === 'SUBMITTED').length },
    { value: 'BIDDING', label: 'Bidding', count: myJobs.filter(j => j.status === 'BIDDING').length },
    { value: 'ACTIVE', label: 'Active', count: myJobs.filter(j => j.status === 'ACTIVE').length },
    { value: 'COMPLETED', label: 'Completed', count: completedJobs.length },
    { value: 'CANCELLED', label: 'Cancelled', count: cancelledJobs.length },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-sm text-gray-500">Loading your shipments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-8">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600 text-sm">Error loading jobs: {error}</p>
            <button 
              onClick={fetchJobs} 
              className="mt-3 text-sm text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
          {/* Header */}
          <div className="mb-5 sm:mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  My Shipments
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Track and manage your posted shipments
                </p>
              </div>
              <Link href="/jobs/create">
                <Button variant="primary" className="flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                  <Plus className="h-4 w-4" />
                  Post Shipment
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards - Mobile optimized */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
            <div className="rounded-lg bg-blue-50 p-3 sm:p-4 text-center">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{activeJobs.length}</p>
              <p className="text-[10px] sm:text-xs text-blue-600">Active</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 sm:p-4 text-center">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-green-600">{completedJobs.length}</p>
              <p className="text-[10px] sm:text-xs text-green-600">Completed</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 sm:p-4 text-center">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mx-auto mb-1 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-red-600">{cancelledJobs.length}</p>
              <p className="text-[10px] sm:text-xs text-red-600">Cancelled</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="space-y-3 mb-4 sm:mb-5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter - Horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                      statusFilter === option.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {myJobs.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500">
                Showing {filteredJobs.length} of {myJobs.length} shipments
              </p>
            </div>
          )}

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
              {searchTerm || statusFilter !== 'ALL' ? (
                <>
                  <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No shipments match your filters</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                    }}
                    className="mt-3 text-sm text-primary-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No shipments yet</p>
                  <Link href="/jobs/create">
                    <Button variant="primary" className="mt-4 text-sm">
                      Post Your First Shipment
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} showActions={true} />
              ))}
            </div>
          )}

          {/* Quick Stats Footer (Mobile) */}
          {myJobs.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-200 sm:hidden">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-sm font-bold text-primary-600">
                    KES {myJobs.reduce((sum, j) => sum + (j.price || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Bids</p>
                  <p className="text-sm font-bold text-gray-900">
                    {myJobs.reduce((sum, j) => sum + (j.bids?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleBasedRoute>
  );
}