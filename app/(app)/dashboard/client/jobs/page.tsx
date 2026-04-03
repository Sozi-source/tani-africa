'use client';

import { useState } from 'react';
import { useJobs } from '@/lib/hooks/useJobs';
import { useAuth } from '@/lib/hooks/useAuth';
import { JobCard } from '@/components/jobs/JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Plus, Package, Search, X } from 'lucide-react';

export default function ClientJobsPage() {
  const { user } = useAuth();
  const { jobs, loading, error, refetch } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter jobs - only show jobs posted by this client
  const myJobs = jobs.filter(job => job.clientId === user?.id);
  
  // Filter by search
  const filteredJobs = myJobs.filter(job => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        job.title?.toLowerCase().includes(searchLower) ||
        job.pickUpLocation?.toLowerCase().includes(searchLower) ||
        job.dropOffLocation?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-8">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">Error loading your jobs: {error}</p>
            <button onClick={() => refetch()} className="mt-3 text-sm text-red-700 underline">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Header */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-5 w-5 text-primary-600" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  My Shipments
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                Track and manage your posted shipments
              </p>
            </div>
            <Link href="/jobs/create">
              <Button variant="primary" className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Post New Shipment</span>
                <span className="xs:hidden">Post</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-white p-3 border border-gray-100">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{myJobs.length}</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-gray-100">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-lg font-bold text-green-600">
              {myJobs.filter(j => ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(j.status)).length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-gray-100">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-bold text-gray-900">
              {myJobs.filter(j => j.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-gray-100">
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-lg font-bold text-primary-600">
              KES {myJobs.reduce((sum, j) => sum + (j.price || 0), 0).toLocaleString()}
            </p>
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

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No shipments match your search' : "You haven't posted any shipments yet"}
            </p>
            {!searchTerm && (
              <Link href="/jobs/create">
                <Button variant="primary" className="mt-4 text-sm">
                  Post Your First Shipment
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job}
                showActions={true}
                showBidButton={false}
                showBranding={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}