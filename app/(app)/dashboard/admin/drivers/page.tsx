'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';

import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';
import { JobCard } from '@/components/jobs/JobCard';
import { WelcomeBanner } from '@/app/(app)/dashboard/components/WelcomeBanner';

import {
  Package,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react';

export default function DriverDashboardPage() {
  const { user, loading: authLoading, initializing } = useAuth();
  const { jobs, loading: jobsLoading, error, refetch } = useJobs();

  const loading = initializing || authLoading || jobsLoading;
  const jobsArray = Array.isArray(jobs) ? jobs : [];

  /* ================= Driver Stats ================= */

  const stats = useMemo(() => {
    if (!user?.id) {
      return { active: [], completed: [] };
    }

    const driverJobs = jobsArray.filter(job => job.driverId === user.id);

    return {
      active: driverJobs.filter(job =>
        ['BIDDING', 'ACTIVE'].includes(job.status)
      ),
      completed: driverJobs.filter(job => job.status === 'COMPLETED'),
    };
  }, [jobsArray, user?.id]);

  /* ================= Guards ================= */

  if (loading) return <DashboardLoader />;

  if (!user) {
    return (
      <DashboardError
        message="Session expired. Please sign in again."
        onRetry={() => (window.location.href = '/auth/login')}
      />
    );
  }

  if (error) {
    return <DashboardError message={error} onRetry={refetch} />;
  }

  /* ================= Render ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8 ">
      <WelcomeBanner
        firstName={user.firstName || 'Driver'}
        role="DRIVER"
        subtitle="Manage your bids and active deliveries"
      />

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl">
        <Stat
          icon={Truck}
          label="Active Jobs"
          value={stats.active.length}
        />
        <Stat
          icon={CheckCircle}
          label="Completed"
          value={stats.completed.length}
        />
        <Stat
          icon={Clock}
          label="Pending"
          value={stats.active.length}
        />
      </div>

      {/* ===== Jobs ===== */}
      <section className="space-y-4 max-w-5xl">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Jobs
        </h2>

        {stats.active.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center text-gray-500">
            <Package className="mx-auto h-10 w-10 mb-3 text-gray-300" />
            No jobs assigned yet. Keep bidding to win deliveries.
          </div>
        ) : (
          <div className="grid gap-4">
            {stats.active.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ================= Reusable Stat ================= */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
      <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}