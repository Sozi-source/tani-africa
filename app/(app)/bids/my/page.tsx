// app/(app)/bids/my/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBids } from '@/lib/hooks/useBids';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BackNavigation } from '@/components/ui/BackNavigation';
import { NavigationArrows } from '@/components/ui/NavigationArrows';
import { Button } from '@/components/ui/Button';
import {
  Truck,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  AlertCircle,
} from 'lucide-react';

/* ================= STATUS BADGE ================= */

const STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  SUBMITTED: { label: 'Pending', className: 'bg-yellow-50 text-yellow-800' },
  PENDING: { label: 'Pending', className: 'bg-yellow-50 text-yellow-800' },
  ACCEPTED: { label: 'Accepted', className: 'bg-green-50 text-green-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-700' },
  EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-600' },
};

/* ================= COMPONENT ================= */

export default function MyBidsPage() {
  const { user } = useAuth();
  const { bids, loading, error, refetch } = useBids();
  const [activeTab, setActiveTab] = useState<'active' | 'accepted' | 'rejected'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  /* ---------- SAFE ARRAY CHECK ---------- */
  // Ensure bids is always an array
  const bidsArray = Array.isArray(bids) ? bids : [];
  
  /* ---------- FILTERING ---------- */
  const myBids = bidsArray.filter(bid => bid.driverId === user?.id);

  const activeBids = myBids.filter(bid =>
    ['SUBMITTED', 'PENDING'].includes(bid.status)
  );
  const acceptedBids = myBids.filter(bid => bid.status === 'ACCEPTED');
  const rejectedBids = myBids.filter(bid =>
    ['REJECTED', 'EXPIRED'].includes(bid.status)
  );

  const baseList =
    activeTab === 'active'
      ? activeBids
      : activeTab === 'accepted'
      ? acceptedBids
      : rejectedBids;

  const displayedBids = searchTerm
    ? baseList.filter(bid =>
        bid.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.job?.pickUpLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : baseList;

  /* ---------- LOADING & ERROR STATES ---------- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <p className="text-red-500 font-medium">{error}</p>
          <button 
            onClick={refetch} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <RoleBasedRoute allowedRoles={['DRIVER', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">

            {/* Back Navigation */}
            <BackNavigation label="Back to Jobs" href="/jobs" />

            {/* Header */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                My Bids
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track all the bids you’ve placed
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <StatItem label="Total Bids" value={myBids.length} />
              <StatItem label="Accepted" value={acceptedBids.length} highlight="green" />
              <StatItem label="Pending" value={activeBids.length} highlight="yellow" />
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job or location…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
              {[
                { id: 'active', label: 'Active', count: activeBids.length },
                { id: 'accepted', label: 'Accepted', count: acceptedBids.length },
                { id: 'rejected', label: 'Rejected', count: rejectedBids.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-3 sm:px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                        activeTab === tab.id
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Results Count */}
            {baseList.length > 0 && (
              <p className="text-xs text-gray-500">
                Showing {displayedBids.length} of {baseList.length} bids
              </p>
            )}

            {/* Bids List */}
            {displayedBids.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 sm:p-12 text-center">
                <Truck className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-4" />
                <p className="text-sm text-gray-500">
                  {searchTerm
                    ? 'No bids match your search'
                    : `No ${activeTab} bids found`}
                </p>
                {activeTab === 'active' && !searchTerm && (
                  <Link href="/jobs">
                    <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                      Browse Available Jobs
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {displayedBids.map(bid => {
                  const status = STATUS_STYLES[bid.status] ?? {
                    label: bid.status,
                    className: 'bg-gray-100 text-gray-700',
                  };

                  return (
                    <Link key={bid.id} href={`/jobs/${bid.jobId}`}>
                      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                          {/* Left Section */}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                              >
                                {status.label}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(bid.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                              {bid.job?.title || `Job #${bid.jobId.slice(-6)}`}
                            </h3>
                            {bid.job && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                  {bid.job.pickUpLocation} → {bid.job.dropOffLocation}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right Section */}
                          <div className="text-left sm:text-right">
                            <p className="text-base sm:text-lg font-bold text-red-600">
                              KES {bid.price.toLocaleString()}
                            </p>
                            {bid.estimatedDuration && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 sm:justify-end mt-1">
                                <Clock className="h-3 w-3" />
                                {bid.estimatedDuration} hrs
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                          <span className="text-xs text-red-600 flex items-center gap-1 font-medium">
                            View Details
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <NavigationArrows hasPrevious={false} hasNext={false} />
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  );
}

/* ================= STAT ITEM COMPONENT ================= */

function StatItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: 'green' | 'yellow';
}) {
  const color =
    highlight === 'green'
      ? 'text-green-700'
      : highlight === 'yellow'
      ? 'text-yellow-800'
      : 'text-gray-900';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 text-center shadow-sm">
      <p className="text-[10px] sm:text-xs text-gray-500">{label}</p>
      <p className={`text-lg sm:text-xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}