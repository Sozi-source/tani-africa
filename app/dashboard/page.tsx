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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import {
  Package,
  Truck,
  DollarSign,
  Clock,
  PlusCircle,
  Eye,
  CheckCircle,
  Users,
  BarChart2,
  Bell,
  ShieldCheck,
  AlertCircle,
  Hammer,
  XCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  User,
  Star,
  Briefcase,
  Menu,
  X,
  Grid3x3,
  List,
} from 'lucide-react';
import { Job, JobStatus, Bid, User as UserType, Vehicle } from '@/types';

// Type definitions
interface JobWithBids extends Job {
  bids?: Bid[];
}

// Flexible job status configuration that accepts any string
const JOB_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
  BIDDING: { label: 'Bidding', color: 'bg-blue-100 text-blue-800', icon: '💰' },
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800', icon: '🚚' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: '✅' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

// Helper function to get status config safely
function getStatusConfig(status: string) {
  return JOB_STATUS_CONFIG[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
    color: 'bg-gray-100 text-gray-800',
    icon: '📦'
  };
}

// ==================== RESPONSIVE STAT CARD ====================
function ResponsiveStatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string;
  trend?: number;
}) {
  return (
    <Card hover className="h-full">
      <CardBody className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={`h-3 w-3 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-xl bg-gradient-to-r ${color} p-2 sm:p-3`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ==================== RESPONSIVE QUICK ACTION ====================
function ResponsiveQuickAction({ 
  href, 
  title, 
  subtitle, 
  icon: Icon, 
  accent = false 
}: { 
  href: string; 
  title: string; 
  subtitle: string; 
  icon: React.ComponentType<{ className?: string }>; 
  accent?: boolean;
}) {
  return (
    <Link href={href}>
      <Card hover className={`cursor-pointer transition-all hover:scale-[1.02] ${accent ? 'border-primary-100 bg-primary-50' : ''}`}>
        <CardBody className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`rounded-lg p-2 sm:p-3 ${accent ? 'bg-primary-100' : 'bg-gray-100'}`}>
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${accent ? 'text-primary-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <p className={`font-semibold text-sm sm:text-base ${accent ? 'text-primary-900' : 'text-gray-900'}`}>
                {title}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </CardBody>
      </Card>
    </Link>
  );
}

// ==================== RESPONSIVE JOB CARD (Fixed Type Error) ====================
function ResponsiveJobCard({ job }: { job: JobWithBids }) {
  const config = getStatusConfig(job.status);
  
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card hover className="cursor-pointer transition-all hover:shadow-md">
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                {job.title || `${job.pickUpLocation} → ${job.dropOffLocation}`}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                  {config.icon} {config.label}
                </span>
                <span className="text-xs text-gray-500">
                  {job.bids?.length || 0} bid{job.bids?.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {job.price && (
              <div className="sm:text-right">
                <span className="text-base sm:text-lg font-bold text-primary-600 whitespace-nowrap">
                  KES {job.price.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

// ==================== ROLE BADGE ====================
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    ADMIN: { label: 'Admin', color: 'bg-gray-900 text-white', icon: ShieldCheck },
    DRIVER: { label: 'Driver', color: 'bg-green-100 text-green-800', icon: Truck },
    CLIENT: { label: 'Client', color: 'bg-blue-100 text-blue-800', icon: User },
  };
  const cfg = config[role] || { label: role, color: 'bg-gray-100 text-gray-800', icon: User };
  const Icon = cfg.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${cfg.color}`}>
      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      {cfg.label}
    </div>
  );
}

// ==================== WELCOME BANNER ====================
function WelcomeBanner({ 
  firstName, 
  role, 
  subtitle, 
  gradient 
}: { 
  firstName?: string; 
  role: string;
  subtitle: string; 
  gradient: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-r ${gradient} p-6 sm:p-8 text-white`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-white/80 text-sm sm:text-base">Welcome back,</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">{firstName}</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-2">{subtitle}</p>
        </div>
        <div className="hidden sm:block">
          <RoleBadge role={role} />
        </div>
      </div>
    </div>
  );
}

// ==================== STATUS CARD ====================
function StatusCard({ 
  icon: Icon, 
  title, 
  message, 
  actionText, 
  actionLink, 
  color 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${color}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-white/50 p-2 sm:p-3">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="font-semibold text-sm sm:text-base">{title}</p>
            <p className="text-xs sm:text-sm mt-1 opacity-80">{message}</p>
          </div>
        </div>
        {actionText && actionLink && (
          <Link href={actionLink} className="sm:ml-auto">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              {actionText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ==================== CLIENT DASHBOARD ====================
function ClientDashboard({ user }: { user: UserType }) {
  const { jobs, loading, error } = useJobs();
  const [application, setApplication] = useState<{ status: string | null }>({ status: null });
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const checkApplication = async () => {
      if (user?.id && user.role === 'CLIENT') {
        try {
          const response = await apiClient.get('/driver-applications/my-status');
          if (response && typeof response === 'object' && 'status' in response) {
            setApplication({ status: String(response.status) });
          }
        } catch (error) {
          setApplication({ status: null });
        } finally {
          setCheckingStatus(false);
        }
      } else {
        setCheckingStatus(false);
      }
    };
    checkApplication();
  }, [user]);

  const stats = useMemo(() => {
    const userJobs = jobs.filter(job => job.clientId === user.id);
    const activeJobs = userJobs.filter(job => 
      ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status)
    );
    const completedJobs = userJobs.filter(job => job.status === 'COMPLETED');
    const totalBids = userJobs.reduce((sum, job) => sum + (job.bids?.length || 0), 0);
    const totalSpent = userJobs.reduce((sum, job) => sum + (job.price || 0), 0);
    return { userJobs, activeJobs, completedJobs, totalBids, totalSpent };
  }, [jobs, user.id]);

  if (loading || checkingStatus) return <DashboardLoader />;
  if (error) return <DashboardError error={error} />;

  const formattedSpent = stats.totalSpent >= 1000 
    ? `KES ${(stats.totalSpent / 1000).toFixed(0)}k` 
    : `KES ${stats.totalSpent}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-8">
        <WelcomeBanner
          firstName={user.firstName}
          role={user.role}
          subtitle="Manage your shipments, track bids, and connect with reliable drivers."
          gradient="from-primary-600 to-secondary-600"
        />

        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <ResponsiveStatCard 
              title="Active Shipments" 
              value={stats.activeJobs.length} 
              icon={Package} 
              color="from-blue-500 to-blue-600"
            />
            <ResponsiveStatCard 
              title="Completed" 
              value={stats.completedJobs.length} 
              icon={CheckCircle} 
              color="from-green-500 to-green-600"
            />
            <ResponsiveStatCard 
              title="Bids Received" 
              value={stats.totalBids} 
              icon={DollarSign} 
              color="from-yellow-500 to-yellow-600"
            />
            <ResponsiveStatCard 
              title="Total Spent" 
              value={formattedSpent} 
              icon={Clock} 
              color="from-purple-500 to-purple-600"
            />
          </div>
        </div>

        <div className="mb-6 sm:mb-8 space-y-3">
          {!checkingStatus && application.status === 'PENDING' && (
            <StatusCard
              icon={Clock}
              title="Driver Application Pending"
              message="Your application is under review. Estimated 24-48 hours."
              color="bg-yellow-50 border-yellow-200 text-yellow-800"
            />
          )}
          {!checkingStatus && !application.status && (
            <StatusCard
              icon={Truck}
              title="Become a Driver"
              message="Apply to join our driver network and start earning"
              actionText="Apply Now"
              actionLink="/driver/apply"
              color="bg-primary-50 border-primary-200 text-primary-800"
            />
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <ResponsiveQuickAction 
              href="/jobs/create" 
              title="Post New Shipment" 
              subtitle="Need to transport cargo?" 
              icon={PlusCircle} 
              accent
            />
            <ResponsiveQuickAction 
              href="/jobs/my" 
              title="My Shipments" 
              subtitle="Track your active shipments" 
              icon={Eye} 
            />
          </div>
        </div>

        {stats.userJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                {stats.userJobs.length > 3 && (
                  <Link href="/jobs/my" className="text-xs sm:text-sm text-primary-600 font-medium hover:underline">
                    View All
                  </Link>
                )}
              </div>
            </div>
            
            <div className={`hidden sm:grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3 sm:gap-4`}>
              {stats.userJobs.slice(0, 6).map(job => (
                <ResponsiveJobCard key={job.id} job={job} />
              ))}
            </div>
            
            <div className="sm:hidden space-y-2">
              {stats.userJobs.slice(0, 3).map(job => (
                <ResponsiveJobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== DRIVER DASHBOARD ====================
function DriverDashboard({ user }: { user: UserType }) {
  const { jobs, loading: jobsLoading } = useJobs();
  const { bids, loading: bidsLoading } = useBids();
  const { vehicles, loading: vehiclesLoading } = useVehicles(user.id);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const loading = jobsLoading || bidsLoading || vehiclesLoading;

  const stats = useMemo(() => {
    const myBids = bids.filter(bid => bid.driverId === user.id);
    const myJobs = jobs.filter(job => job.driverId === user.id);
    const availableJobs = jobs.filter(job => job.status === 'BIDDING');
    const acceptedBids = myBids.filter(bid => bid.status === 'ACCEPTED');
    const earnings = myJobs
      .filter(job => job.status === 'COMPLETED')
      .reduce((sum, job) => sum + (job.price || 0), 0);
    return { myBids, myJobs, availableJobs, acceptedBids, earnings };
  }, [jobs, bids, user.id]);

  if (loading) return <DashboardLoader />;

  const formattedEarnings = stats.earnings >= 1000 
    ? `KES ${(stats.earnings / 1000).toFixed(0)}k` 
    : `KES ${stats.earnings}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-8">
        <WelcomeBanner
          firstName={user.firstName}
          role={user.role}
          subtitle="Find loads, place bids, and grow your business"
          gradient="from-green-600 to-teal-600"
        />

        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <ResponsiveStatCard 
              title="Available Jobs" 
              value={stats.availableJobs.length} 
              icon={Package} 
              color="from-blue-500 to-blue-600"
            />
            <ResponsiveStatCard 
              title="Active Deliveries" 
              value={stats.myJobs.filter(j => j.status === 'ACTIVE').length} 
              icon={Truck} 
              color="from-green-500 to-green-600"
            />
            <ResponsiveStatCard 
              title="Bids Placed" 
              value={stats.myBids.length} 
              icon={Hammer} 
              color="from-yellow-500 to-yellow-600"
            />
            <ResponsiveStatCard 
              title="Earnings" 
              value={formattedEarnings} 
              icon={DollarSign} 
              color="from-purple-500 to-purple-600"
            />
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <ResponsiveQuickAction href="/jobs" title="Browse Jobs" subtitle="Find available shipments" icon={Briefcase} accent />
            <ResponsiveQuickAction href="/bids" title="My Bids" subtitle="Track your submitted bids" icon={Hammer} />
            <ResponsiveQuickAction href="/vehicles" title="My Vehicles" subtitle={`${vehicles.length} registered`} icon={Truck} />
          </div>
        </div>

        {stats.availableJobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Available Jobs</h2>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                {stats.availableJobs.length > 6 && (
                  <Link href="/jobs" className="text-xs sm:text-sm text-primary-600 font-medium hover:underline">
                    View All
                  </Link>
                )}
              </div>
            </div>
            <div className={`hidden sm:grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3 sm:gap-4`}>
              {stats.availableJobs.slice(0, 6).map(job => (
                <ResponsiveJobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="sm:hidden space-y-2">
              {stats.availableJobs.slice(0, 3).map(job => (
                <ResponsiveJobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>
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

  const formattedRevenue = stats?.totalRevenue ? 
    (stats.totalRevenue >= 1000 ? `KES ${(stats.totalRevenue / 1000).toFixed(0)}k` : `KES ${stats.totalRevenue}`) 
    : 'KES 0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-8">
        <WelcomeBanner
          firstName={user.firstName}
          role={user.role}
          subtitle="Monitor platform activity, manage users, and approve drivers."
          gradient="from-gray-800 to-gray-700"
        />

        <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <ResponsiveStatCard title="Total Jobs" value={jobs.length} icon={Package} color="from-blue-500 to-blue-600" />
            <ResponsiveStatCard title="Active Jobs" value={jobs.filter(j => j.status === 'ACTIVE').length} icon={Truck} color="from-green-500 to-green-600" />
            <ResponsiveStatCard title="Total Users" value={users.length} icon={Users} color="from-yellow-500 to-yellow-600" />
            <ResponsiveStatCard title="Revenue" value={formattedRevenue} icon={DollarSign} color="from-purple-500 to-purple-600" />
          </div>
        </div>

        <div className="mb-6 sm:mb-8 space-y-3">
          {pendingDrivers.length > 0 && (
            <StatusCard
              icon={ShieldCheck}
              title={`${pendingDrivers.length} Driver${pendingDrivers.length > 1 ? 's' : ''} Pending Approval`}
              message="Review and approve driver applications"
              actionText="Review Now"
              actionLink="/admin/drivers"
              color="bg-blue-50 border-blue-200 text-blue-800"
            />
          )}
          {jobs.filter(j => j.status === 'SUBMITTED').length > 0 && (
            <StatusCard
              icon={AlertCircle}
              title={`${jobs.filter(j => j.status === 'SUBMITTED').length} Job${jobs.filter(j => j.status === 'SUBMITTED').length > 1 ? 's' : ''} Pending Review`}
              message="Review new job submissions"
              actionText="Review Now"
              actionLink="/admin/jobs"
              color="bg-yellow-50 border-yellow-200 text-yellow-800"
            />
          )}
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <ResponsiveQuickAction href="/admin/drivers" title="Approve Drivers" subtitle="Review pending applications" icon={ShieldCheck} accent />
            <ResponsiveQuickAction href="/admin/users" title="Manage Users" subtitle="View all platform users" icon={Users} />
            <ResponsiveQuickAction href="/admin/jobs" title="All Jobs" subtitle="Monitor all shipments" icon={Package} />
            <ResponsiveQuickAction href="/admin/stats" title="Analytics" subtitle="Platform performance" icon={BarChart2} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== LOADING & ERROR COMPONENTS ====================
function DashboardLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );
}

function DashboardError({ error }: { error: string | Error }) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
        <p className="text-sm text-gray-500 mb-4">{errorMessage}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ==================== MAIN DASHBOARD ====================
export default function DashboardPage() {
  const { user, loading, isAuthenticated, isClient, isDriver, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !user) return <DashboardLoader />;

  if (isClient) return <ClientDashboard user={user} />;
  if (isDriver) return <DriverDashboard user={user} />;
  if (isAdmin) return <AdminDashboard user={user} />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Role not recognized. Please contact support.</p>
      </div>
    </div>
  );
}