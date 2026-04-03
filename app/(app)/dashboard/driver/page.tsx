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
import { Package, Truck, DollarSign, Hammer, Briefcase, Grid3x3, List } from 'lucide-react';

interface DriverDashboardProps {
  user?: UserType;
}

export default function DriverDashboard({ user: propUser }: DriverDashboardProps) {
  // ✅ Get user from AuthContext as fallback when no prop is passed
  const { user: authUser, loading: authLoading } = useAuth();
  const user = propUser || authUser;

  const { 
    jobs = [], 
    loading: jobsLoading = false, 
    error: jobsError = null, 
    refetch: refetchJobs 
  } = useJobs();
  
  const { 
    bids = [], 
    loading: bidsLoading = false, 
    refetch: refetchBids 
  } = useBids();
  
  const { 
    vehicles = [], 
    loading: vehiclesLoading = false 
  } = useVehicles(user?.id);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  
  // ✅ Include authLoading so we wait for user before rendering error
  const loading = authLoading || jobsLoading || bidsLoading || vehiclesLoading;
  const error = jobsError;

  const stats = useMemo(() => {
    const safeBids = Array.isArray(bids) ? bids : [];
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    
    const myBids = safeBids.filter(bid => bid.driverId === user?.id);
    const myJobs = safeJobs.filter(job => job.driverId === user?.id);
    const availableJobs = safeJobs.filter(job => job.status === 'BIDDING');
    const activeJobs = myJobs.filter(job => job.status === 'ACTIVE');
    const earnings = myJobs
      .filter(job => job.status === 'COMPLETED')
      .reduce((sum, job) => sum + (job.price || 0), 0);
    
    return { myBids, myJobs, availableJobs, activeJobs, earnings };
  }, [jobs, bids, user?.id]);

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

  if (error) return <DashboardError message={error} onRetry={refetchJobs} />;

  const displayedJobs = showAllJobs 
    ? stats.availableJobs 
    : stats.availableJobs.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          
          <WelcomeBanner
            firstName={user.firstName || 'Driver'}
            role={user.role || 'DRIVER'}
            subtitle="Find loads, place bids, and grow your business"
            gradient="from-amber-500 to-orange-500"
          />

          {/* Stats Grid */}
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <StatCard 
                title="Available Jobs" 
                value={stats.availableJobs.length} 
                icon={Package} 
                color="from-blue-500 to-blue-600" 
              />
              <StatCard 
                title="Active Jobs" 
                value={stats.activeJobs.length} 
                icon={Truck} 
                color="from-green-500 to-green-600" 
              />
              <StatCard 
                title="My Bids" 
                value={stats.myBids.length} 
                icon={Hammer} 
                color="from-yellow-500 to-yellow-600" 
              />
              <StatCard 
                title="Total Earnings" 
                value={`KES ${(stats.earnings / 1000).toFixed(0)}k`} 
                icon={DollarSign} 
                color="from-purple-500 to-purple-600" 
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <QuickActionCard
                href="/jobs"
                icon={<Briefcase />}
                title="Browse Jobs"
                description="Find available shipments"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
              <QuickActionCard
                href="/bids"
                icon={<Hammer />}
                title="My Bids"
                description={`${stats.myBids.length} active ${stats.myBids.length === 1 ? 'bid' : 'bids'}`}
                iconBgColor="bg-gray-100"
                iconColor="text-gray-600"
              />
              <QuickActionCard
                href="/vehicles"
                icon={<Truck />}
                title="My Vehicles"
                description={`${vehicles?.length || 0} registered`}
                iconBgColor="bg-gray-100"
                iconColor="text-gray-600"
              />
            </div>
          </div>

          {/* Available Jobs */}
          {stats.availableJobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-700">Available Jobs</h2>
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
                  {stats.availableJobs.length > 6 && (
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
                {displayedJobs.map((job) => (
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
              
              <div className="sm:hidden space-y-2">
                {displayedJobs.slice(0, 3).map((job) => (
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
                {stats.availableJobs.length > 3 && !showAllJobs && (
                  <button 
                    onClick={() => setShowAllJobs(true)} 
                    className="w-full text-center text-xs text-amber-600 py-2 font-medium hover:underline"
                  >
                    View {stats.availableJobs.length - 3} more jobs
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {stats.availableJobs.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No available jobs at the moment</p>
              <p className="text-xs text-gray-400 mt-1">Check back later for new shipments</p>
            </div>
          )}
        </div>
      </div>

      {/* Place Bid Modal */}
      {selectedJob && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => { 
            setShowBidModal(false); 
            setSelectedJob(null); 
          }}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title || `Transport from ${selectedJob.pickUpLocation}`}
          onSuccess={async () => { 
            if (refetchBids) await refetchBids(); 
            if (refetchJobs) await refetchJobs();
            setShowBidModal(false); 
            setSelectedJob(null); 
          }}
        />
      )}
    </div>
  );
}