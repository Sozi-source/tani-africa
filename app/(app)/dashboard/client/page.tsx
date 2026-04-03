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
  List 
} from 'lucide-react';

interface ClientDashboardProps {
  user?: UserType;
}

export default function ClientDashboard({ user: propUser }: ClientDashboardProps) {
  // ✅ Get user from AuthContext as fallback when no prop is passed
  const { user: authUser, loading: authLoading } = useAuth();
  const user = propUser || authUser;

  const { jobs, loading: jobsLoading, error, refetch } = useJobs();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllJobs, setShowAllJobs] = useState(false);

  // ✅ Include authLoading so we wait for user before rendering error
  const loading = authLoading || jobsLoading;

  const jobsArray = Array.isArray(jobs) ? jobs : [];
  
  const stats = useMemo(() => {
    // ✅ Guard against undefined user — safe with optional chaining
    if (!user?.id) return { userJobs: [], activeJobs: [], completedJobs: [], totalBids: 0, totalSpent: 0 };

    const userJobs = jobsArray.filter(job => job.clientId === user.id);
    const activeJobs = userJobs.filter(job => ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status));
    const completedJobs = userJobs.filter(job => job.status === 'COMPLETED');
    const totalBids = userJobs.reduce((sum, job) => sum + (job.bids?.length || 0), 0);
    const totalSpent = userJobs.reduce((sum, job) => sum + (job.price || 0), 0);
    return { userJobs, activeJobs, completedJobs, totalBids, totalSpent };
  }, [jobsArray, user?.id]);

  // ✅ Only show error after auth has finished loading
  if (loading) return <DashboardLoader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DashboardError
          message="User not found. Please log in again."
          onRetry={() => window.location.href = '/auth/login'}
        />
      </div>
    );
  }

  if (error) return <DashboardError message={error} onRetry={refetch} />;

  const displayedJobs = showAllJobs ? stats.userJobs : stats.userJobs.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          
          <WelcomeBanner
            firstName={user.firstName || 'Client'}
            role={user.role || 'CLIENT'}
            subtitle="Manage your shipments, track bids, and connect with reliable drivers."
            gradient="from-blue-500 to-blue-600"
          />

          {/* Stats Grid */}
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <StatCard title="Active" value={stats.activeJobs.length} icon={Package} color="from-blue-500 to-blue-600" />
              <StatCard title="Completed" value={stats.completedJobs.length} icon={CheckCircle} color="from-green-500 to-green-600" />
              <StatCard title="Bids Received" value={stats.totalBids} icon={DollarSign} color="from-yellow-500 to-yellow-600" />
              <StatCard title="Total Spent" value={`KES ${(stats.totalSpent / 1000).toFixed(0)}k`} icon={Clock} color="from-purple-500 to-purple-600" />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <QuickActionCard
                href="/jobs/create"
                icon={<PlusCircle />}
                title="Post Shipment"
                description="Need to transport cargo?"
                iconBgColor="bg-amber-100"
                iconColor="text-amber-600"
              />
              <QuickActionCard
                href="/jobs/my"
                icon={<Eye />}
                title="My Shipments"
                description="Track active shipments"
                iconBgColor="bg-gray-100"
                iconColor="text-gray-600"
              />
            </div>
          </div>

          {/* Recent Jobs */}
          {stats.userJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-700">Recent Jobs</h2>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                    <button 
                      onClick={() => setViewMode('grid')} 
                      className={`p-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}
                    >
                      <Grid3x3 className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')} 
                      className={`p-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}
                    >
                      <List className="h-3 w-3" />
                    </button>
                  </div>
                  {stats.userJobs.length > 6 && (
                    <button 
                      onClick={() => setShowAllJobs(!showAllJobs)} 
                      className="text-[11px] sm:text-xs text-amber-600 font-medium hover:underline"
                    >
                      {showAllJobs ? 'Show Less' : 'View All'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className={`hidden sm:grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3`}>
                {displayedJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
              
              <div className="sm:hidden space-y-2">
                {displayedJobs.slice(0, 3).map(job => <JobCard key={job.id} job={job} />)}
                {stats.userJobs.length > 3 && !showAllJobs && (
                  <button 
                    onClick={() => setShowAllJobs(true)} 
                    className="w-full text-center text-xs text-amber-600 py-2 font-medium hover:underline"
                  >
                    View {stats.userJobs.length - 3} more jobs
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {stats.userJobs.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No jobs yet</p>
              <Link href="/jobs/create">
                <Button variant="primary" className="mt-4 text-sm">
                  Post Your First Shipment
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}