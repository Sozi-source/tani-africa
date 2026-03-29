'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  DollarSign, 
  Clock, 
  PlusCircle, 
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ClientDashboard() {
  const { user, isClient } = useAuth();
  const { jobs, loading } = useJobs();
  
  const myJobs = jobs.filter(job => job.clientId === user?.id);
  const activeJobs = myJobs.filter(job => 
    ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status)
  );
  const completedJobs = myJobs.filter(job => job.status === 'COMPLETED');
  const totalBids = myJobs.reduce((sum, job) => sum + (job.bids?.length || 0), 0);

  const stats = [
    {
      title: 'Active Shipments',
      value: activeJobs.length,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Completed Shipments',
      value: completedJobs.length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Bids Received',
      value: totalBids,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Total Spent',
      value: `KES ${myJobs.reduce((sum, job) => sum + (job.price || 0), 0).toLocaleString()}`,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Welcome Section */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
        <h1 className="text-2xl font-bold md:text-3xl">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-primary-100">
          Manage your shipments, track bids, and connect with reliable drivers
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-full bg-gradient-to-r ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/jobs/create">
            <Card hover className="cursor-pointer border-primary-100 bg-primary-50">
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary-900">Post New Shipment</p>
                  <p className="text-sm text-primary-600">Need to transport cargo?</p>
                </div>
                <PlusCircle className="h-8 w-8 text-primary-500" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/jobs/my">
            <Card hover className="cursor-pointer">
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">View My Shipments</p>
                  <p className="text-sm text-gray-500">Track your active shipments</p>
                </div>
                <Eye className="h-8 w-8 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Shipments */}
      {myJobs.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Shipments</h2>
          <div className="space-y-3">
            {myJobs.slice(0, 5).map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card hover className="cursor-pointer transition-all">
                  <CardBody className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {job.title || `From ${job.pickUpLocation} to ${job.dropOffLocation}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {job.status} • Bids: {job.bids?.length || 0}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {job.price && (
                        <span className="text-lg font-bold text-primary-600">
                          KES {job.price.toLocaleString()}
                        </span>
                      )}
                      <Eye className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}