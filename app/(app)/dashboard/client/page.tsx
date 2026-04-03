// app/(app)/dashboard/client/page.tsx
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
  const { user: authUser, loading: authLoading } = useAuth();
  const user = propUser || authUser;

  const { jobs, loading: jobsLoading, error, refetch } = useJobs();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllJobs, setShowAllJobs] = useState(false);

  const loading = authLoading || jobsLoading;
  const jobsArray = Array.isArray(jobs) ? jobs : [];
  
  const stats = useMemo(() => {
    if (!user?.id) return { userJobs: [], activeJobs: [], completedJobs: [], totalBids: 0, totalSpent: 0 };

    const userJobs = jobsArray.filter(job => job.clientId === user.id);
    const activeJobs = userJobs.filter(job => ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status));
    const completedJobs = userJobs.filter(job => job.status === 'COMPLETED');
    const totalBids = userJobs.reduce((sum, job) => sum + (job.bids?.length || 0), 0);
    const totalSpent = userJobs.reduce((sum, job) => sum + (job.price || 0), 0);
    return { userJobs, activeJobs, completedJobs, totalBids, totalSpent };
  }, [jobsArray, user?.id]);

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
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
          
          <WelcomeBanner
            firstName={user.firstName || 'Client'}
            role={user.role || 'CLIENT'}
            subtitle="Manage your shipments, track bids, and connect with reliable drivers."
            gradient="from-blue-500 to-blue-600"
          />

          {/* Stats Grid - Increased Font Sizes */}
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-4 sm:mb-5 md:mb-6">Performance Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              <StatCard 
                title="Active Shipments" 
                value={stats.activeJobs.length} 
                icon={Package} 
                color="from-blue-500 to-blue-600" 
              />
              <StatCard 
                title="Completed" 
                value={stats.completedJobs.length} 
                icon={CheckCircle} 
                color="from-green-500 to-green-600" 
              />
              <StatCard 
                title="Bids Received" 
                value={stats.totalBids} 
                icon={DollarSign} 
                color="from-yellow-500 to-yellow-600" 
              />
              <StatCard 
                title="Total Spent" 
                value={`KES ${(stats.totalSpent / 1000).toFixed(0)}k`} 
                icon={Clock} 
                color="from-purple-500 to-purple-600" 
              />
            </div>
          </div>

          {/* Quick Actions - Increased Font Sizes */}
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-4 sm:mb-5 md:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <QuickActionCard
                href="/jobs/create"
                icon={<PlusCircle />}
                title="Post New Shipment"
                description="Need to transport cargo? Post a job now"
                iconBgColor="bg-amber-100"
                iconColor="text-amber-600"
              />
              <QuickActionCard
                href="/jobs/my"
                icon={<Eye />}
                title="My Shipments"
                description="Track and manage your active shipments"
                iconBgColor="bg-gray-100"
                iconColor="text-gray-600"
              />
            </div>
          </div>

          {/* Recent Jobs - Increased Font Sizes */}
          {stats.userJobs.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5 md:mb-6">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Recent Shipments</h2>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={() => setViewMode('grid')} 
                      className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}
                    >
                      <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')} 
                      className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}
                    >
                      <List className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  {stats.userJobs.length > 6 && (
                    <button 
                      onClick={() => setShowAllJobs(!showAllJobs)} 
                      className="text-sm sm:text-base text-amber-600 font-semibold hover:underline"
                    >
                      {showAllJobs ? 'Show Less' : `View All (${stats.userJobs.length})`}
                    </button>
                  )}
                </div>
              </div>
              
              <div className={`hidden sm:grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4 sm:gap-5 md:gap-6`}>
                {displayedJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
              
              <div className="sm:hidden space-y-4">
                {displayedJobs.slice(0, 3).map(job => <JobCard key={job.id} job={job} />)}
                {stats.userJobs.length > 3 && !showAllJobs && (
                  <button 
                    onClick={() => setShowAllJobs(true)} 
                    className="w-full text-center text-sm font-medium text-amber-600 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    View {stats.userJobs.length - 3} more shipments
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State - Increased Font Sizes */}
          {stats.userJobs.length === 0 && (
            <div className="text-center py-16 sm:py-20 md:py-24">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3">No Shipments Yet</h3>
              <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-md mx-auto">
                Get started by posting your first shipment and connect with reliable drivers
              </p>
              <Link href="/jobs/create">
                <Button variant="primary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
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