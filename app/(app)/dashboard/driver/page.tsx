'use client';

import { useAuth } from '@/context/AuthContext';
import { useDriverJobs } from '@/lib/hooks/useDriverJobs';

import { WelcomeBanner } from '../components/WelcomeBanner';
import { JobCard } from '../components/JobCard';
import { DashboardLoader } from '../components/DashboardLoader';
import { DashboardError } from '../components/DashboardError';

import {
  Truck,
  Clock,
  CheckCircle,
  Package,
} from 'lucide-react';

export default function DriverDashboardPage() {
  const { user, loading: authLoading, initializing } = useAuth();
  const {
    availableJobs,
    assignedJobs,
    loading: jobsLoading,
    error,
    refetch,
  } = useDriverJobs();

  const loading = initializing || authLoading || jobsLoading;

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
    return (
      <DashboardError
        message={error}
        onRetry={refetch}
      />
    );
  }

  const activeJobs = assignedJobs.filter(j =>
    ['BIDDING', 'ACTIVE'].includes(j.status)
  );

  const completedJobs = assignedJobs.filter(
    j => j.status === 'COMPLETED'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 md:space-y-10">
      <WelcomeBanner
        firstName={user.firstName || 'Driver'}
        role="DRIVER"
        subtitle="Browse available jobs and manage your deliveries"
      />

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-7xl mx-auto">
        <Stat icon={Truck} label="Available Jobs" value={availableJobs.length} />
        <Stat icon={Clock} label="Active Jobs" value={activeJobs.length} />
        <Stat icon={CheckCircle} label="Completed" value={completedJobs.length} />
      </div>

      {/* ===== Available Jobs ===== */}
      <Section title="Available Jobs">
        {availableJobs.length === 0 ? (
          <EmptyState message="No jobs available at the moment." />
        ) : (
          <div className="grid gap-4 md:gap-5">
            {availableJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Section>

      {/* ===== My Active Jobs ===== */}
      <Section title="My Active Jobs">
        {activeJobs.length === 0 ? (
          <EmptyState message="You have no active jobs." />
        ) : (
          <div className="grid gap-4 md:gap-5">
            {activeJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Section>

      {/* ===== Completed Jobs ===== */}
      <Section title="Completed Jobs">
        {completedJobs.length === 0 ? (
          <EmptyState message="No completed jobs yet." />
        ) : (
          <div className="grid gap-4 md:gap-5">
            {completedJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ================= Helpers ================= */

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
      <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 text-orange-600">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </div>
      <div>
        <p className="text-xs sm:text-sm text-gray-500">{label}</p>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <section className="space-y-3 sm:space-y-4 md:space-y-5 max-w-7xl mx-auto">
      <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-white p-8 sm:p-10 md:p-12 lg:p-16 text-center text-gray-500">
      <Package className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-3 text-gray-300" />
      <p className="text-sm sm:text-base md:text-lg">{message}</p>
    </div>
  );
}