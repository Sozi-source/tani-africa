'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useBids } from '@/lib/hooks/useBids';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BackNavigation } from '@/components/ui/BackNavigation';
import { NavigationArrows } from '@/components/ui/NavigationArrows';
import { useState } from 'react';
import Link from 'next/link';
import { Truck, MapPin, Clock, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MyBidsPage() {
  const { user } = useAuth();
  const { bids, loading, error, refetch } = useBids();
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  const myBids = bids.filter(bid => bid.driverId === user?.id);
  
  const activeBids = myBids.filter(bid => ['SUBMITTED', 'PENDING'].includes(bid.status));
  const acceptedBids = myBids.filter(bid => bid.status === 'ACCEPTED');
  const rejectedBids = myBids.filter(bid => ['REJECTED', 'EXPIRED'].includes(bid.status));

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; bgColor: string }> = {
      SUBMITTED: { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-50' },
      PENDING: { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-50' },
      ACCEPTED: { label: 'Accepted', color: 'text-green-800', bgColor: 'bg-green-50' },
      REJECTED: { label: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-50' },
      EXPIRED: { label: 'Expired', color: 'text-gray-800', bgColor: 'bg-gray-50' },
    };
    const cfg = config[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-50' };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  const getDisplayedBids = () => {
    let bidsList = [];
    if (activeTab === 'active') bidsList = activeBids;
    else if (activeTab === 'accepted') bidsList = acceptedBids;
    else bidsList = rejectedBids;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return bidsList.filter(bid => 
        bid.job?.title?.toLowerCase().includes(searchLower) ||
        bid.job?.pickUpLocation?.toLowerCase().includes(searchLower)
      );
    }
    return bidsList;
  };

  const displayedBids = getDisplayedBids();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['DRIVER', 'ADMIN']}>
      {/* Back Navigation - mobile only */}
      <BackNavigation label="Back to Jobs" href="/jobs" />

      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">My Bids</h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">Track all the bids you've placed</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <div className="rounded-lg bg-white p-3 text-center shadow-sm border border-gray-100">
          <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{myBids.length}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <p className="text-[10px] sm:text-xs text-green-600">Accepted</p>
          <p className="text-lg sm:text-2xl font-bold text-green-900">{acceptedBids.length}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-3 text-center">
          <p className="text-[10px] sm:text-xs text-yellow-600">Pending</p>
          <p className="text-lg sm:text-2xl font-bold text-yellow-900">{activeBids.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {[
          { id: 'active', label: 'Active', count: activeBids.length },
          { id: 'accepted', label: 'Accepted', count: acceptedBids.length },
          { id: 'rejected', label: 'Rejected', count: rejectedBids.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Results Count */}
      {myBids.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            Showing {displayedBids.length} of {activeTab === 'active' ? activeBids.length : activeTab === 'accepted' ? acceptedBids.length : rejectedBids.length} bids
          </p>
        </div>
      )}

      {/* Bids List */}
      {displayedBids.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Truck className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            {searchTerm ? 'No bids match your search' : `No ${activeTab} bids found`}
          </p>
          {activeTab === 'active' && !searchTerm && (
            <Link href="/jobs">
              <Button className="mt-4 text-sm">Browse Jobs</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedBids.map((bid, index) => (
            <Link key={bid.id} href={`/jobs/${bid.jobId}`}>
              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {getStatusBadge(bid.status)}
                        <span className="text-[10px] text-gray-400">
                          {new Date(bid.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">
                        {bid.job?.title || `Job #${bid.jobId.slice(-8)}`}
                      </h3>
                      {bid.job && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="truncate">{bid.job.pickUpLocation} → {bid.job.dropOffLocation}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-600">
                        KES {bid.price.toLocaleString()}
                      </p>
                      {bid.estimatedDuration && (
                        <p className="text-[10px] text-gray-400">{bid.estimatedDuration} hrs</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <span className="text-xs text-primary-600 flex items-center gap-0.5">
                      View Details
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Navigation Arrows for pagination (if applicable) */}
      <NavigationArrows
        hasPrevious={false}
        hasNext={false}
      />
    </RoleBasedRoute>
  );
}