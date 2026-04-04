'use client';

import { useState, useMemo } from 'react';
import { User as UserType, Job } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';
import { useVehicles } from '@/lib/hooks/useVehicles';

import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { JobCard } from '../components/JobCard';
import { DashboardLoader } from '../components/DashboardLoader';
import { DashboardError } from '../components/DashboardError';
import { QuickActionCard } from '../components/QuickActionCard';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';

import {
  Package,
  Truck,
  DollarSign,
  Hammer,
  Briefcase,
  Grid3x3,
  List,
} from 'lucide-react';

interface DriverDashboardProps {
  user?: UserType;
}

export default function DriverDashboard({ user: propUser }: DriverDashboardProps) {
  /* ================= AUTH ================= */

  const { user: authUser, loading: authLoading } = useAuth();
  const user = propUser || authUser;

  /* ================= DATA ================= */

  const {
    jobs = [],
    loading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useJobs();

  const {
    bids = [],
    loading: bidsLoading,
    refetch: refetchBids,
  } = useBids();

  const {
    vehicles = [],
    loading: vehiclesLoading,
  } = useVehicles(user?.id);

  /* ================= UI STATE ================= */

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);

  /* ================= DERIVED DATA ================= */

  const loading =
    authLoading || jobsLoading || bidsLoading || vehiclesLoading;

  const stats = useMemo(() => {
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    const safeBids = Array.isArray(bids) ? bids : [];

    const myBids = safeBids.filter(b => b.driverId === user?.id);
    const myJobs = safeJobs.filter(j => j.driverId === user?.id);

    const availableJobs = safeJobs.filter(j => j.status === 'BIDDING');
    const activeJobs = myJobs.filter(j => j.status === 'ACTIVE');

    const earnings = myJobs
      .filter(j => j.status === 'COMPLETED')
      .reduce((sum, j) => sum + (j.price || 0), 0);

    return {
      myBids,
      availableJobs,
      activeJobs,
      earnings,
    };
  }, [jobs, bids, user?.id]);

  /* ================= GUARDS ================= */

  if (loading) return <DashboardLoader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DashboardError
          message="User not found. Please log in again."
          onRetry={() => (window.location.href = '/auth/login')}
        />
      </div>
    );
  }

  if (jobsError) {
    return <DashboardError message={jobsError} onRetry={refetchJobs} />;
  }

  const displayedJobs = showAllJobs
    ? stats.availableJobs
    : stats.availableJobs.slice(0, 6);

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">

        {/* ===== Welcome ===== */}
        <WelcomeBanner
          firstName={user.firstName || 'Driver'}
          role="DRIVER"
          subtitle="Find loads, place bids, and grow your transport business"
        />

        {/* ===== Stats ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Performance Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Available Jobs"
              value={stats.availableJobs.length}
              icon={Package}
              color="yellow"
            />
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs.length}
              icon={Truck}
              color="green"
            />
            <StatCard
              title="My Bids"
              value={stats.myBids.length}
              icon={Hammer}
              color="yellow"
            />
            <StatCard
              title="Total Earnings"
              value={`KES ${stats.earnings.toLocaleString()}`}
              icon={DollarSign}
              color="gray"
            />
          </div>
        </section>

        {/* ===== Quick Actions ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard
              href="/jobs"
              icon={<Briefcase className="h-5 w-5" />}
              title="Browse Jobs"
              description="Find available shipments"
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-800"
            />

            <QuickActionCard
              href="/bids"
              icon={<Hammer className="h-5 w-5" />}
              title="My Bids"
              description={`${stats.myBids.length} active bids`}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-700"
            />

            <QuickActionCard
              href="/vehicles"
              icon={<Truck className="h-5 w-5" />}
              title="My Vehicles"
              description={`${vehicles.length} registered`}
              iconBgColor="bg-green-100"
              iconColor="text-green-700"
            />
          </div>
        </section>

        {/* ===== Available Jobs ===== */}
        {stats.availableJobs.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Available Jobs
              </h2>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${
                      viewMode === 'grid'
                        ? 'bg-white shadow text-orange-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${
                      viewMode === 'list'
                        ? 'bg-white shadow text-orange-600'
                        : 'text-gray-500'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {stats.availableJobs.length > 6 && (
                  <button
                    onClick={() => setShowAllJobs(!showAllJobs)}
                    className="text-xs font-medium text-orange-600 hover:underline"
                  >
                    {showAllJobs ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {displayedJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  showBidButton
                  onPlaceBid={(jobItem) => {
                    setSelectedJob(jobItem);
                    setShowBidModal(true);
                  }}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              No available jobs at the moment
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Check back later for new shipments
            </p>
          </div>
        )}
      </div>

      {/* ===== Place Bid Modal ===== */}
      {selectedJob && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedJob(null);
          }}
          jobId={selectedJob.id}
          jobTitle={
            selectedJob.title ||
            `Transport from ${selectedJob.pickUpLocation}`
          }
          onSuccess={async () => {
            await refetchBids();
            await refetchJobs();
            setShowBidModal(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}