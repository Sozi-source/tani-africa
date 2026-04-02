// app/dashboard/page.tsx - Optimized for mobile
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { useAdminUsers, useAdminStats, useDriverApprovals } from '@/lib/hooks/useAdmin';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { PlaceBidModal } from '@/components/bids/PlaceBidModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import {
  Package,
  Truck,
  DollarSign,
  PlusCircle,
  Eye,
  CheckCircle,
  Users,
  BarChart2,
  ShieldCheck,
  AlertCircle,
  Hammer,
  XCircle,
  TrendingUp,
  ChevronRight,
  User,
  Star,
  Briefcase,
  Grid3x3,
  List,
  MapPin,
  Sparkles,
  Clock,
  Calendar,
  Bell,
  Award
} from 'lucide-react';
import { Job, JobStatus, Bid, User as UserType, Vehicle } from '@/types';

// Job status configuration
const JOB_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
  BIDDING: { label: 'Bidding', color: 'bg-blue-100 text-blue-800', icon: '💰' },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: '🚚' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: '✅' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

function getStatusConfig(status: string) {
  return JOB_STATUS_CONFIG[status] || {
    label: status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    icon: '📦'
  };
}

// ==================== RESPONSIVE STAT CARD ====================
function StatCard({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
  trend?: number;
}) {
  return (
    <Card hover className="h-full transition-all duration-300 hover:shadow-lg">
      <CardBody className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5 truncate">{title}</p>
            <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <div className="hidden sm:flex items-center gap-1 mt-1">
                <TrendingUp className={`h-3 w-3 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-xl bg-gradient-to-r ${color} p-2 sm:p-2.5 md:p-3 flex-shrink-0`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ==================== RESPONSIVE JOB CARD ====================
function JobCard({ job, showBidButton = false, onPlaceBid }: { 
  job: Job; 
  showBidButton?: boolean;
  onPlaceBid?: (job: Job) => void;
}) {
  const config = getStatusConfig(job.status);
  const router = useRouter();
  
  return (
    <Card hover className="cursor-pointer transition-all hover:shadow-md" onClick={() => router.push(`/jobs/${job.id}`)}>
      <CardBody className="p-3 sm:p-4 md:p-5">
        {/* Mobile layout: Stacked, Desktop: Row */}
        <div className="flex flex-col gap-3">
          {/* Top row with status and price */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                <span>{config.icon}</span>
                <span className="hidden xs:inline">{config.label}</span>
              </span>
              {job.bids && (
                <span className="text-xs text-gray-500">
                  {job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {job.price && (
              <span className="text-sm sm:text-base font-bold text-amber-600 whitespace-nowrap">
                KES {job.price.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Job details */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2">
              {job.title || `${job.pickUpLocation} → ${job.dropOffLocation}`}
            </h3>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{job.pickUpLocation} → {job.dropOffLocation}</span>
            </div>
            {job.cargoType && (
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Package className="h-3 w-3 mr-1" />
                <span>{job.cargoType}{job.cargoWeight ? ` • ${job.cargoWeight} kg` : ''}</span>
              </div>
            )}
          </div>
          
          {/* Action button */}
          <div className="flex justify-end">
            {showBidButton && job.status === 'BIDDING' ? (
              <Button
                size="sm"
                variant="primary"
                onClick={(e) => { e.stopPropagation(); onPlaceBid?.(job); }}
                className="w-full sm:w-auto text-sm"
              >
                Place Bid
              </Button>
            ) : !showBidButton && (
              <Button size="sm" variant="outline" className="w-full sm:w-auto text-sm">
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ==================== WELCOME BANNER ====================
function WelcomeBanner({ firstName, role, subtitle, gradient }: { 
  firstName?: string; 
  role: string;
  subtitle: string; 
  gradient: string;
}) {
  const roleColors = {
    ADMIN: 'from-purple-500 to-purple-600',
    DRIVER: 'from-amber-500 to-orange-500',
    CLIENT: 'from-blue-500 to-blue-600'
  };
  
  const bgGradient = gradient || roleColors[role as keyof typeof roleColors] || 'from-gray-500 to-gray-600';
  
  return (
    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r ${bgGradient} p-4 sm:p-6 md:p-8 text-white shadow-xl`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-yellow-300/20 rounded-full blur-2xl" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 relative z-10">
        <div className="flex-1">
          <p className="text-white/90 text-xs sm:text-sm flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-300 rounded-full animate-pulse"></span>
            Welcome back,
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-0.5 sm:mt-1">
            {firstName || 'User'}!
          </h1>
          <p className="text-white/90 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1 flex-wrap">
            <Sparkles className="h-3 w-3" />
            {subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs sm:text-sm font-semibold shadow-lg">
            {role === 'DRIVER' && <Truck className="h-3 w-3 sm:h-4 sm:w-4" />}
            {role === 'CLIENT' && <User className="h-3 w-3 sm:h-4 sm:w-4" />}
            {role === 'ADMIN' && <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" />}
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== LOADING & ERROR ====================
function DashboardLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );
}

// ==================== CLIENT DASHBOARD ====================
function ClientDashboard({ user }: { user: UserType }) {
  const { jobs, loading, error } = useJobs();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllJobs, setShowAllJobs] = useState(false);

  const stats = useMemo(() => {
    const userJobs = jobs.filter(job => job.clientId === user.id);
    const activeJobs = userJobs.filter(job => ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status));
    const completedJobs = userJobs.filter(job => job.status === 'COMPLETED');
    const totalBids = userJobs.reduce((sum, job) => sum + (job.bids?.length || 0), 0);
    const totalSpent = userJobs.reduce((sum, job) => sum + (job.price || 0), 0);
    return { userJobs, activeJobs, completedJobs, totalBids, totalSpent };
  }, [jobs, user.id]);

  if (loading) return <DashboardLoader />;
  if (error) return <ErrorState message={error} />;

  const displayedJobs = showAllJobs ? stats.userJobs : stats.userJobs.slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <WelcomeBanner
        firstName={user.firstName}
        role={user.role}
        subtitle="Manage your shipments, track bids, and connect with reliable drivers."
        gradient="from-blue-500 to-blue-600"
      />

      {/* Stats Grid - Responsive columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard title="Active" value={stats.activeJobs.length} icon={Package} color="from-blue-500 to-blue-600" />
        <StatCard title="Completed" value={stats.completedJobs.length} icon={CheckCircle} color="from-green-500 to-green-600" />
        <StatCard title="Bids" value={stats.totalBids} icon={DollarSign} color="from-yellow-500 to-yellow-600" />
        <StatCard title="Spent" value={`KES ${(stats.totalSpent / 1000).toFixed(0)}k`} icon={Clock} color="from-purple-500 to-purple-600" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          <Link href="/jobs/create">
            <Card hover className="cursor-pointer transition-all hover:shadow-md">
              <CardBody className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Post Shipment</p>
                    <p className="text-xs text-gray-500 hidden xs:block">Need to transport cargo?</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/jobs/my">
            <Card hover className="cursor-pointer transition-all hover:shadow-md">
              <CardBody className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">My Shipments</p>
                    <p className="text-xs text-gray-500 hidden xs:block">Track active shipments</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      {stats.userJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Recent Jobs</h2>
            <div className="flex items-center gap-2">
              {/* View toggle - desktop only */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}>
                  <Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}>
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
              {stats.userJobs.length > 6 && (
                <button onClick={() => setShowAllJobs(!showAllJobs)} className="text-xs sm:text-sm text-amber-600 font-medium hover:underline">
                  {showAllJobs ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
          </div>
          
          {/* Desktop view */}
          <div className={`hidden sm:grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3 sm:gap-4`}>
            {displayedJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
          
          {/* Mobile view - always list */}
          <div className="sm:hidden space-y-2">
            {displayedJobs.slice(0, 3).map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== DRIVER DASHBOARD ====================
function DriverDashboard({ user }: { user: UserType }) {
  const { jobs, loading: jobsLoading } = useJobs();
  const { bids, loading: bidsLoading, placeBid, refetch: refetchBids } = useBids();
  const { vehicles, loading: vehiclesLoading } = useVehicles(user.id);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  
  const loading = jobsLoading || bidsLoading || vehiclesLoading;

  const stats = useMemo(() => {
    const myBids = bids.filter(bid => bid.driverId === user.id);
    const myJobs = jobs.filter(job => job.driverId === user.id);
    const availableJobs = jobs.filter(job => job.status === 'BIDDING');
    const acceptedBids = myBids.filter(bid => bid.status === 'ACCEPTED');
    const earnings = myJobs.filter(job => job.status === 'COMPLETED').reduce((sum, job) => sum + (job.price || 0), 0);
    return { myBids, myJobs, availableJobs, acceptedBids, earnings };
  }, [jobs, bids, user.id]);

  if (loading) return <DashboardLoader />;

  const displayedJobs = showAllJobs ? stats.availableJobs : stats.availableJobs.slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <WelcomeBanner
        firstName={user.firstName}
        role={user.role}
        subtitle="Find loads, place bids, and grow your business"
        gradient="from-amber-500 to-orange-500"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard title="Available" value={stats.availableJobs.length} icon={Package} color="from-blue-500 to-blue-600" />
        <StatCard title="Active" value={stats.myJobs.filter(j => j.status === 'ACTIVE').length} icon={Truck} color="from-green-500 to-green-600" />
        <StatCard title="Bids" value={stats.myBids.length} icon={Hammer} color="from-yellow-500 to-yellow-600" />
        <StatCard title="Earnings" value={`KES ${(stats.earnings / 1000).toFixed(0)}k`} icon={DollarSign} color="from-purple-500 to-purple-600" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <Link href="/jobs">
            <Card hover className="cursor-pointer transition-all hover:shadow-md">
              <CardBody className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-blue-100 p-2"><Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-sm sm:text-base">Browse Jobs</p><p className="text-xs text-gray-500 hidden xs:block">Find shipments</p></div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/bids">
            <Card hover className="cursor-pointer transition-all hover:shadow-md">
              <CardBody className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gray-100 p-2"><Hammer className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-sm sm:text-base">My Bids</p><p className="text-xs text-gray-500 hidden xs:block">Track your bids</p></div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/vehicles">
            <Card hover className="cursor-pointer transition-all hover:shadow-md">
              <CardBody className="p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-lg bg-gray-100 p-2"><Truck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-sm sm:text-base">My Vehicles</p><p className="text-xs text-gray-500 hidden xs:block">{vehicles.length} registered</p></div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>

      {/* Available Jobs */}
      {stats.availableJobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Available Jobs</h2>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}><Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'}`}><List className="h-3 w-3 sm:h-4 sm:w-4" /></button>
              </div>
              {stats.availableJobs.length > 6 && (
                <button onClick={() => setShowAllJobs(!showAllJobs)} className="text-xs sm:text-sm text-amber-600 font-medium hover:underline">
                  {showAllJobs ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
          </div>
          
          <div className={`hidden sm:grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3 sm:gap-4`}>
            {displayedJobs.map(job => <JobCard key={job.id} job={job} showBidButton onPlaceBid={(job) => { setSelectedJob(job); setShowBidModal(true); }} />)}
          </div>
          
          <div className="sm:hidden space-y-2">
            {displayedJobs.slice(0, 3).map(job => <JobCard key={job.id} job={job} showBidButton onPlaceBid={(job) => { setSelectedJob(job); setShowBidModal(true); }} />)}
          </div>
        </div>
      )}

      {/* Place Bid Modal */}
      {selectedJob && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => { setShowBidModal(false); setSelectedJob(null); }}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title || `Transport from ${selectedJob.pickUpLocation}`}
          onSuccess={async () => { await refetchBids(); setShowBidModal(false); setSelectedJob(null); }}
        />
      )}
    </div>
  );
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ user }: { user: UserType }) {
  const { jobs, loading: jobsLoading } = useJobs();
  const { users, loading: usersLoading } = useAdminUsers();
  const { stats } = useAdminStats();
  const { drivers: pendingDrivers } = useDriverApprovals();
  
  const loading = jobsLoading || usersLoading;
  if (loading) return <DashboardLoader />;

  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
  const pendingJobs = jobs.filter(j => j.status === 'SUBMITTED').length;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <WelcomeBanner
        firstName={user.firstName}
        role={user.role}
        subtitle="Monitor platform activity, manage users, and approve drivers."
        gradient="from-purple-500 to-purple-600"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <StatCard title="Total Jobs" value={jobs.length} icon={Package} color="from-blue-500 to-blue-600" />
        <StatCard title="Active" value={activeJobs} icon={Truck} color="from-green-500 to-green-600" />
        <StatCard title="Users" value={users.length} icon={Users} color="from-yellow-500 to-yellow-600" />
        <StatCard title="Revenue" value={`KES ${((stats?.totalRevenue || 0) / 1000).toFixed(0)}k`} icon={DollarSign} color="from-purple-500 to-purple-600" />
      </div>

      {/* Alerts */}
      {(pendingDrivers.length > 0 || pendingJobs > 0) && (
        <div className="space-y-2 sm:space-y-3">
          {pendingDrivers.length > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm sm:text-base">{pendingDrivers.length} Driver{pendingDrivers.length > 1 ? 's' : ''} Pending</p>
                    <p className="text-xs sm:text-sm text-blue-700">Review and approve driver applications</p>
                  </div>
                </div>
                <Link href="/admin/drivers" className="sm:ml-auto"><Button variant="outline" size="sm">Review</Button></Link>
              </div>
            </div>
          )}
          {pendingJobs > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 text-sm sm:text-base">{pendingJobs} Job{pendingJobs > 1 ? 's' : ''} Pending</p>
                    <p className="text-xs sm:text-sm text-yellow-700">Review new job submissions</p>
                  </div>
                </div>
                <Link href="/admin/jobs" className="sm:ml-auto"><Button variant="outline" size="sm">Review</Button></Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Link href="/admin/drivers">
            <Card hover className="cursor-pointer">
              <CardBody className="p-3 sm:p-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="rounded-lg bg-blue-100 p-2"><ShieldCheck className="h-4 w-4 text-blue-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-xs sm:text-sm">Drivers</p><p className="text-xs text-gray-500 hidden sm:block">Review</p></div>
                </div>
              </CardBody>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card hover className="cursor-pointer">
              <CardBody className="p-3 sm:p-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="rounded-lg bg-gray-100 p-2"><Users className="h-4 w-4 text-gray-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-xs sm:text-sm">Users</p><p className="text-xs text-gray-500 hidden sm:block">Manage</p></div>
                </div>
              </CardBody>
            </Card>
          </Link>
          <Link href="/admin/jobs">
            <Card hover className="cursor-pointer">
              <CardBody className="p-3 sm:p-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="rounded-lg bg-gray-100 p-2"><Package className="h-4 w-4 text-gray-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-xs sm:text-sm">Jobs</p><p className="text-xs text-gray-500 hidden sm:block">Monitor</p></div>
                </div>
              </CardBody>
            </Card>
          </Link>
          <Link href="/admin/stats">
            <Card hover className="cursor-pointer">
              <CardBody className="p-3 sm:p-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="rounded-lg bg-gray-100 p-2"><BarChart2 className="h-4 w-4 text-gray-600" /></div>
                  <div><p className="font-semibold text-gray-900 text-xs sm:text-sm">Analytics</p><p className="text-xs text-gray-500 hidden sm:block">Stats</p></div>
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN DASHBOARD ====================
export default function DashboardPage() {
  const { user, loading, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login');
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <DashboardLoader />;

  if (isClient) return <ClientDashboard user={user} />;
  if (isDriver) return <DriverDashboard user={user} />;
  if (isAdmin) return <AdminDashboard user={user} />;

  return <ErrorState message="Role not recognized. Please contact support." />;

}