'use client';

import { useState, useMemo } from 'react';
import { User as UserType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';

import { WelcomeBanner } from '../components/WelcomeBanner';
import { StatCard } from '../components/StatCard';
import { JobCard } from '../components/JobCard';
import { DashboardLoader } from '../components/DashboardLoader';
import { DashboardError } from '../components/DashboardError';
import { QuickActionCard } from '../components/QuickActionCard';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import {
  Package,
  CheckCircle,
  DollarSign,
  Clock,
  PlusCircle,
  Eye,
  Grid3x3,
  List,
  TrendingUp,
  Wallet,
  Calendar,
} from 'lucide-react';

interface ClientDashboardProps {
  user?: UserType;
}

export default function ClientDashboard({ user: propUser }: ClientDashboardProps) {
  const { user: authUser, loading: authLoading } = useAuth();
  const user = propUser || authUser;

  const { jobs, loading: jobsLoading, error, refetch } = useJobs();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllJobs, setShowAllJobs] = useState(false);

  const loading = authLoading || jobsLoading;
  const jobsArray = Array.isArray(jobs) ? jobs : [];

  const stats = useMemo(() => {
    if (!user?.id) {
      return {
        userJobs: [],
        activeJobs: [],
        completedJobs: [],
        totalBids: 0,
        totalSpent: 0,
      };
    }

    const userJobs = jobsArray.filter(job => job.clientId === user.id);
    const activeJobs = userJobs.filter(job =>
      ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status)
    );
    const completedJobs = userJobs.filter(job => job.status === 'COMPLETED');
    const totalBids = userJobs.reduce((sum, job) => sum + (job.bids?.length || 0), 0);
    const totalSpent = userJobs.reduce((sum, job) => sum + (job.price || 0), 0);

    return { userJobs, activeJobs, completedJobs, totalBids, totalSpent };
  }, [jobsArray, user?.id]);

  if (loading) return <DashboardLoader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <DashboardError
          message="User not found. Please log in again."
          onRetry={() => (window.location.href = '/auth/login')}
        />
      </div>
    );
  }

  if (error) return <DashboardError message={error} onRetry={refetch} />;

  const displayedJobs = showAllJobs
    ? stats.userJobs
    : stats.userJobs.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* ===== Welcome Banner ===== */}
        <WelcomeBanner
          firstName={user.firstName || 'Client'}
          role={user.role || 'CLIENT'}
          subtitle="Manage your shipments and track performance"
        />

        {/* ===== Stats Section ===== */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">
              Performance Overview
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Shipments"
              value={stats.activeJobs.length}
              icon={Package}
              color="yellow"
            />
            <StatCard
              title="Completed"
              value={stats.completedJobs.length}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Bids Received"
              value={stats.totalBids}
              icon={DollarSign}
              color="yellow"
            />
            <StatCard
              title="Total Spent"
              value={`KES ${stats.totalSpent.toLocaleString()}`}
              icon={Clock}
              color="purple"
            />
          </div>
        </section>

        {/* ===== Quick Actions ===== */}
        <section>
          <h2 className="text-lg font-semibold text-black mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              href="/jobs/create"
              icon={<PlusCircle />}
              title="Post New Shipment"
              description="Create a shipment request for drivers to bid on"
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
            <QuickActionCard
              href="/jobs/my"
              icon={<Eye />}
              title="My Shipments"
              description="Track and manage your jobs"
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-700"
            />
          </div>
        </section>

        {/* ===== Recent Shipments ===== */}
        {stats.userJobs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">
                Recent Shipments
              </h2>

              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-white text-orange-600 shadow'
                      : 'text-gray-500'
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list'
                      ? 'bg-white text-orange-600 shadow'
                      : 'text-gray-500'
                  }`}
                >
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
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {!showAllJobs && stats.userJobs.length > 6 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllJobs(true)}
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  View All ({stats.userJobs.length})
                </button>
              </div>
            )}
          </section>
        )}

        {/* ===== Empty State ===== */}
        {stats.userJobs.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              No Shipments Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Post your first shipment to start receiving bids.
            </p>
            <Link href="/jobs/create">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <PlusCircle className="h-4 w-4" />
                Post Your First Shipment
              </Button>
            </Link>
          </div>
        )}

        {/* ===== Mobile Footer Stats ===== */}
        {stats.userJobs.length > 0 && (
          <div className="pt-4 border-t border-gray-200 sm:hidden">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                Jobs
                <span className="font-semibold text-black">{stats.userJobs.length}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Wallet className="h-4 w-4" />
                <span className="font-semibold text-orange-600">
                  KES {stats.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}