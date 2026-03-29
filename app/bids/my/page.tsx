'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useBids } from '@/lib/hooks/useBids';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { BidCard } from '@/components/bids/BidCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tabs } from '@/components/ui/Tabs';
import { useState } from 'react';

export default function MyBidsPage() {
  const { user } = useAuth();
  const { bids, loading, error } = useBids();
  const [activeTab, setActiveTab] = useState('active');

  const myBids = bids.filter(bid => bid.driverId === user?.id);

  const activeBids = myBids.filter(bid => 
    ['SUBMITTED', 'PENDING'].includes(bid.status)
  );
  const acceptedBids = myBids.filter(bid => bid.status === 'ACCEPTED');
  const rejectedBids = myBids.filter(bid => 
    ['REJECTED', 'EXPIRED'].includes(bid.status)
  );

  const tabs = [
    { id: 'active', label: 'Active Bids', count: activeBids.length },
    { id: 'accepted', label: 'Accepted', count: acceptedBids.length },
    { id: 'rejected', label: 'Rejected', count: rejectedBids.length },
  ];

  const getBidsForTab = () => {
    switch (activeTab) {
      case 'accepted': return acceptedBids;
      case 'rejected': return rejectedBids;
      default: return activeBids;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['DRIVER', 'ADMIN']}>
      <div className="container-custom py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">My Bids</h1>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {error ? (
            <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
              Error: {error}
            </div>
          ) : getBidsForTab().length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No {activeTab} bids found</p>
              {activeTab === 'active' && (
                <div className="mt-4">
                  <a href="/jobs" className="text-primary-600 hover:underline">
                    Browse Available Jobs →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getBidsForTab().map((bid) => (
                <BidCard key={bid.id} bid={bid} showActions={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleBasedRoute>
  );
}