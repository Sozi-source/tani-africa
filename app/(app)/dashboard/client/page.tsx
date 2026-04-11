// app/dashboard/client/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Package,
  CheckCircle,
  DollarSign,
  PlusCircle,
  Eye,
  Grid3x3,
  List,
  TrendingUp,
  Wallet,
  Calendar,
  Truck,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Star,
} from 'lucide-react';

import { StatCard, StatsGrid } from '../components/StatCard'
import type { Job, User, JobStatus } from '@/types';

// ==================== HELPER FUNCTIONS ====================

const getJobStatusDisplay = (status: JobStatus) => {
  const statusConfig: Record<JobStatus, { label: string; color: string; bg: string }> = {
    PENDING_APPROVAL: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    APPROVED: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100' },
    REJECTED: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
    BIDDING: { label: 'Bidding', color: 'text-blue-700', bg: 'bg-blue-100' },
    ACTIVE: { label: 'Active', color: 'text-maroon-700', bg: 'bg-maroon-100' },
    COMPLETED: { label: 'Completed', color: 'text-teal-700', bg: 'bg-teal-100' },
    CANCELLED: { label: 'Cancelled', color: 'text-gray-700', bg: 'bg-gray-100' },
  };
  return statusConfig[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-100' };
};

// ==================== COMPONENTS ====================

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
}

function QuickActionCard({ href, icon, title, description, iconBgColor, iconColor }: QuickActionCardProps) {
  return (
    <Link href={href}>
      <div className="card group cursor-pointer hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2 ${iconBgColor} transition-transform group-hover:scale-105 duration-300`}>
            <div className={`h-4 w-4 ${iconColor}`}>{icon}</div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-maroon-500 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

function JobCard({ job, compact = false }: JobCardProps) {
  const statusDisplay = getJobStatusDisplay(job.status);

  if (compact) {
    return (
      <div className="card hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-maroon-100 p-1.5">
              <Package className="h-4 w-4 text-maroon-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {job.pickUpLocation} → {job.dropOffLocation}
              </p>
              <p className="text-xs text-gray-500">KES {job.price?.toLocaleString() || 0}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusDisplay.bg} ${statusDisplay.color}`}>
            {statusDisplay.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-maroon-100 p-1.5">
            <Truck className="h-3.5 w-3.5 text-maroon-600" />
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusDisplay.bg} ${statusDisplay.color}`}>
            {statusDisplay.label}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {new Date(job.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
          {job.title || 'Shipment'}
        </h3>
        <div className="flex items-center gap-2 text-sm mb-1">
          <span className="font-medium text-gray-900 line-clamp-1">{job.pickUpLocation}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium text-gray-900 line-clamp-1">{job.dropOffLocation}</span>
        </div>
        {job.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Budget</p>
          <p className="text-sm font-bold text-maroon-600">KES {job.price?.toLocaleString() || 0}</p>
        </div>
        <Link href={`/dashboard/client/jobs/${job.id}`}>
          <button className="text-xs font-medium text-maroon-600 hover:text-maroon-700 flex items-center gap-1 transition-colors">
            View Details
            <ChevronRight className="h-3 w-3" />
          </button>
        </Link>
      </div>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 text-maroon-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );
}

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
}

function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto h-16 w-16 rounded-full bg-maroon-100 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-maroon-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
        <p className="text-gray-500 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-600 text-white rounded-lg font-medium hover:bg-maroon-700 transition-all shadow-sm hover:shadow-md"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

interface StatsData {
  userJobs: Job[];
  activeJobs: number;
  completedJobs: number;
  totalBids: number;
  totalSpent: number;
}

export default function ClientDashboardPage() {
  const { user, loading: authLoading, initializing } = useAuth();
  const { jobs, loading: jobsLoading, error, refetch } = useJobs();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllJobs, setShowAllJobs] = useState(false);

  const loading = initializing || authLoading || jobsLoading;
  
  const jobsArray = useMemo((): Job[] => {
    if (Array.isArray(jobs)) {
      return jobs;
    }
    return [];
  }, [jobs]);

  const stats = useMemo((): StatsData => {
    if (!user?.id || jobsArray.length === 0) {
      return {
        userJobs: [],
        activeJobs: 0,
        completedJobs: 0,
        totalBids: 0,
        totalSpent: 0,
      };
    }

    const userJobs = jobsArray.filter((job: Job) => job.clientId === user.id);
    const activeJobs = userJobs.filter((job: Job) =>
      ['APPROVED', 'BIDDING', 'ACTIVE'].includes(job.status)
    );
    const completedJobs = userJobs.filter((job: Job) => job.status === 'COMPLETED');
    const totalBids = userJobs.reduce(
      (sum: number, job: Job) => sum + (job.bids?.length || 0),
      0
    );
    const totalSpent = userJobs
      .filter((job: Job) => job.status === 'COMPLETED')
      .reduce((sum: number, job: Job) => sum + (job.price || 0), 0);

    return { userJobs, activeJobs: activeJobs.length, completedJobs: completedJobs.length, totalBids, totalSpent };
  }, [jobsArray, user?.id]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  if (loading) return <DashboardLoader />;
  if (!user) return null;
  if (error) return <DashboardError message={error} onRetry={refetch} />;

  const displayedJobs = showAllJobs ? stats.userJobs : stats.userJobs.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6 space-y-8">

        {/* ===== Welcome Banner - Naivas Theme ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-maroon p-6 shadow-lg">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-6 w-6 text-yellow-400" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Welcome back, {user.firstName || 'Client'}!
                  </h1>
                </div>
                <p className="text-maroon-100 text-sm sm:text-base">
                  Manage your shipments and track performance with Tani Africa
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-xs text-yellow-200">Account Type</p>
                  <p className="text-sm font-semibold text-white">{user.role || 'CLIENT'}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* ===== Stats Grid ===== */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Performance Overview
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <StatsGrid>
            <StatCard
              title="Active Shipments"
              value={stats.activeJobs}
              icon={Package}
              color="maroon"
              trend={{ value: 12, isPositive: true, label: "vs last month" }}
            />
            <StatCard
              title="Completed"
              value={stats.completedJobs}
              icon={CheckCircle}
              color="green"
              trend={{ value: 8, isPositive: true, label: "vs last month" }}
            />
            <StatCard
              title="Bids Received"
              value={stats.totalBids}
              icon={DollarSign}
              color="gold"
            />
            <StatCard
              title="Total Spent"
              value={`KES ${stats.totalSpent.toLocaleString()}`}
              icon={Wallet}
              color="teal"
            />
          </StatsGrid>
        </section>

        {/* ===== Quick Actions ===== */}
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              href="/dashboard/client/jobs/create"
              icon={<PlusCircle />}
              title="Post New Shipment"
              description="Create a shipment request for drivers to bid on"
              iconBgColor="bg-maroon-100"
              iconColor="text-maroon-600"
            />
            <QuickActionCard
              href="/dashboard/client/jobs"
              icon={<Eye />}
              title="My Shipments"
              description="Track and manage your jobs"
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
          </div>
        </section>

        {/* ===== Recent Shipments ===== */}
        {stats.userJobs.length > 0 && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Recent Shipments
              </h2>

              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-maroon-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-maroon-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
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
              {viewMode === 'list' 
                ? displayedJobs.map((job: Job) => (
                    <JobCard key={job.id} job={job} compact />
                  ))
                : displayedJobs.map((job: Job) => (
                    <JobCard key={job.id} job={job} />
                  ))
              }
            </div>

            {!showAllJobs && stats.userJobs.length > 6 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllJobs(true)}
                  className="text-sm font-medium text-maroon-600 hover:text-maroon-700 inline-flex items-center gap-1"
                >
                  View All ({stats.userJobs.length} shipments)
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {showAllJobs && stats.userJobs.length > 6 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllJobs(false)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Show Less
                </button>
              </div>
            )}
          </section>
        )}

        {/* ===== Empty State ===== */}
        {stats.userJobs.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-20 w-20 rounded-full bg-maroon-100 flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-maroon-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Shipments Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Post your first shipment to start receiving bids from qualified drivers.
            </p>
            <Link href="/dashboard/client/jobs/create">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-maroon-600 text-white rounded-lg font-medium hover:bg-maroon-700 transition-all shadow-sm hover:shadow-md">
                <PlusCircle className="h-4 w-4" />
                Post Your First Shipment
              </button>
            </Link>
          </div>
        )}

        {/* ===== Mobile Footer Stats ===== */}
        {stats.userJobs.length > 0 && (
          <div className="pt-4 border-t border-gray-200 sm:hidden">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>Jobs</span>
                <span className="font-semibold text-gray-900">
                  {stats.userJobs.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Wallet className="h-4 w-4" />
                <span className="font-semibold text-maroon-600">
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