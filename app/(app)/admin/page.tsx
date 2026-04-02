'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useAdminStats, useDriverApprovals, useAdminUsers } from '@/lib/hooks/useAdmin';
import { useJobs } from '@/lib/hooks/useJobs';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Users,
  Truck,
  Package,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  BarChart2,
  Settings,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
// Remove revalidate - it doesn't work with 'use client'
// export const revalidate = 0; // DELETE THIS LINE

export default function AdminDashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { stats, loading: statsLoading } = useAdminStats();
  const { drivers: pendingDrivers, loading: driversLoading } = useDriverApprovals();
  const { jobs, loading: jobsLoading } = useJobs();
  const { users, loading: usersLoading } = useAdminUsers();

  const loading = authLoading || statsLoading || driversLoading || jobsLoading || usersLoading;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Calculate stats
  const totalJobs = jobs?.length || 0;
  const activeJobs = jobs?.filter(j => j.status === 'ACTIVE').length || 0;
  const completedJobs = jobs?.filter(j => j.status === 'COMPLETED').length || 0;
  const pendingJobs = jobs?.filter(j => j.status === 'SUBMITTED').length || 0;
  const totalRevenue = jobs?.filter(j => j.status === 'COMPLETED').reduce((sum, j) => sum + (j.price || 0), 0) || 0;
  const totalUsers = users?.length || 0;
  const totalDrivers = users?.filter(u => u.role === 'DRIVER').length || 0;
  const totalClients = users?.filter(u => u.role === 'CLIENT').length || 0;
  const pendingApprovals = pendingDrivers?.length || 0;

  const statsCards = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      href: '/admin/users',
    },
    {
      title: 'Total Drivers',
      value: totalDrivers,
      icon: Truck,
      color: 'from-green-500 to-green-600',
      href: '/admin/drivers',
    },
    {
      title: 'Total Clients',
      value: totalClients,
      icon: UserCheck,
      color: 'from-purple-500 to-purple-600',
      href: '/admin/users',
    },
    {
      title: 'Total Jobs',
      value: totalJobs,
      icon: Briefcase,
      color: 'from-cyan-500 to-cyan-600',
      href: '/admin/jobs',
    },
    {
      title: 'Active Jobs',
      value: activeJobs,
      icon: Clock,
      color: 'from-emerald-500 to-emerald-600',
      href: '/admin/jobs?status=active',
    },
    {
      title: 'Completed Jobs',
      value: completedJobs,
      icon: CheckCircle,
      color: 'from-gray-500 to-gray-600',
      href: '/admin/jobs?status=completed',
    },
    {
      title: 'Total Revenue',
      value: `KES ${(totalRevenue / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      href: '/admin/stats',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals,
      icon: ShieldCheck,
      color: 'from-orange-500 to-orange-600',
      href: '/admin/drivers',
    },
  ];

  const quickActions = [
    {
      title: 'Driver Approvals',
      description: `${pendingApprovals} driver${pendingApprovals !== 1 ? 's' : ''} pending`,
      icon: ShieldCheck,
      href: '/admin/drivers',
      color: 'bg-orange-50 text-orange-600',
      accent: pendingApprovals > 0,
    },
    {
      title: 'Manage Users',
      description: `${totalUsers} registered users`,
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-50 text-blue-600',
      accent: false,
    },
    {
      title: 'All Jobs',
      description: `${totalJobs} total jobs`,
      icon: Briefcase,
      href: '/admin/jobs',
      color: 'bg-green-50 text-green-600',
      accent: false,
    },
    {
      title: 'Analytics',
      description: 'View platform metrics',
      icon: BarChart2,
      href: '/admin/stats',
      color: 'bg-purple-50 text-purple-600',
      accent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.firstName}! Monitor platform activity and manage users.
          </p>
        </div>

        {/* Pending Alerts */}
        {pendingApprovals > 0 && (
          <div className="mb-6 rounded-xl bg-orange-50 p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-semibold text-orange-800">
                    {pendingApprovals} Driver{pendingApprovals !== 1 ? 's' : ''} Pending Approval
                  </p>
                  <p className="text-sm text-orange-600">
                    Review and approve driver applications to get them on the road
                  </p>
                </div>
              </div>
              <Link href="/admin/drivers">
                <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
                  Review Now
                </button>
              </Link>
            </div>
          </div>
        )}

        {pendingJobs > 0 && (
          <div className="mb-6 rounded-xl bg-yellow-50 p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-semibold text-yellow-800">
                    {pendingJobs} Job{pendingJobs !== 1 ? 's' : ''} Pending Review
                  </p>
                  <p className="text-sm text-yellow-600">
                    New jobs need to be reviewed before they go live
                  </p>
                </div>
              </div>
              <Link href="/admin/jobs?status=pending">
                <button className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 transition-colors">
                  Review Jobs
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} href={stat.href}>
                <Card hover className="cursor-pointer h-full">
                  <CardBody className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`rounded-full bg-gradient-to-r ${stat.color} p-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <Card hover className={`cursor-pointer transition-all hover:scale-[1.02] ${action.accent ? 'border-orange-200 bg-orange-50' : ''}`}>
                    <CardBody className="flex items-center gap-4 p-4">
                      <div className={`rounded-lg p-3 ${action.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className={`font-semibold ${action.accent ? 'text-orange-900' : 'text-gray-900'}`}>
                          {action.title}
                        </p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Jobs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <Link href="/admin/jobs" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {jobs?.slice(0, 5).map((job) => (
                <Card key={job.id}>
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {job.title || `${job.pickUpLocation} → ${job.dropOffLocation}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {job.client?.firstName} {job.client?.lastName}
                        </p>
                        <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          job.status === 'BIDDING' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      {job.price && (
                        <span className="text-lg font-bold text-primary-600">
                          KES {job.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
              {jobs?.length === 0 && (
                <p className="text-center text-gray-500 py-8">No jobs yet</p>
              )}
            </div>
          </div>

          {/* Pending Drivers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pending Driver Applications</h2>
              <Link href="/admin/drivers" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {pendingDrivers?.slice(0, 5).map((driver) => (
                <Card key={driver.id}>
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {driver.user.firstName} {driver.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{driver.user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">License: {driver.licenseNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          Pending
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
              {pendingDrivers?.length === 0 && (
                <p className="text-center text-gray-500 py-8">No pending applications</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}