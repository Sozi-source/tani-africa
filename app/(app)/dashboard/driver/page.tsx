'use client';

import { useState, useMemo, useEffect } from 'react';
import { User as UserType, Job, Bid } from '@/types';
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
    loading: bidsLoading,
    getBidsByJob,
  } = useBids();

  const {
    vehicles = [],
    loading: vehiclesLoading,
  } = useVehicles(user?.id);

  /* ================= LOCAL STATE ================= */

  const [driverBids, setDriverBids] = useState<Bid[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);

  /* ================= FETCH DRIVER BIDS ================= */

  useEffect(() => {
    if (!user?.id || jobs.length === 0) return;

    let cancelled = false;

    const loadBids = async () => {
      try {
        const bidsByJob = await Promise.all(
          jobs.map(j => getBidsByJob(j.id))
        );

        const allBids = bidsByJob.flat();
        const myBids = allBids.filter(
          b => b.driverId === user.id
        );

        if (!cancelled) setDriverBids(myBids);
      } catch {
        // silently fail — dashboard still works
      }
    };

    loadBids();
    return () => {
      cancelled = true;
    };
  }, [jobs, user?.id, getBidsByJob]);

  /* ================= DERIVED DATA ================= */

  const loading =
    authLoading || jobsLoading || bidsLoading || vehiclesLoading;

  const stats = useMemo(() => {
    const myJobs = jobs.filter(j => j.driverId === user?.id);

    const availableJobs = jobs.filter(j => j.status === 'BIDDING');
    const activeJobs = myJobs.filter(j => j.status === 'ACTIVE');

    const earnings = myJobs
      .filter(j => j.status === 'COMPLETED')
      .reduce((sum, j) => sum + (j.price || 0), 0);

    return {
      myBids: driverBids,
      availableJobs,
      activeJobs,
      earnings,
    };
  }, [jobs, driverBids, user?.id]);

  /* ================= GUARDS ================= */

  if (loading) return <DashboardLoader />;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

        <WelcomeBanner
          firstName={user.firstName || 'Driver'}
          role="DRIVER"
          subtitle="Find loads, place bids, and grow your transport business"
        />

        {/* ===== Stats ===== */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Available Jobs"
              value={stats.availableJobs.length}
              icon={Package}
            />
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs.length}
              icon={Truck}
            />
            <StatCard
              title="My Bids"
              value={stats.myBids.length}
              icon={Hammer}
            />
            <StatCard
              title="Total Earnings"
              value={`KES ${stats.earnings.toLocaleString()}`}
              icon={DollarSign}
            />
          </div>
        </section>

        {/* ===== Available Jobs ===== */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold">Available Jobs</h2>

            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')}>
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </button>
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
                onPlaceBid={jobItem => {
                  setSelectedJob(jobItem);
                  setShowBidModal(true);
                }}
              />
            ))}
          </div>
        </section>
      </div>

      {/* ===== Bid Modal ===== */}
      {selectedJob && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedJob(null);
          }}
          jobId={selectedJob.id}
          jobTitle={
            selectedJob.title ??
            `Transport from ${selectedJob.pickUpLocation}`
          }
          onSuccess={async () => {
            await refetchJobs();
            setShowBidModal(false);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}