'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { 
  Truck, 
  Gavel, 
  DollarSign, 
  Star, 
  Car,
  Briefcase,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { bids, loading: bidsLoading } = useBids();
  const { vehicles, loading: vehiclesLoading } = useVehicles(user?.id);

  const availableJobs = jobs.filter(job => job.status === 'BIDDING');
  const myBids = bids.filter(bid => bid.driverId === user?.id);
  const acceptedBids = myBids.filter(bid => bid.status === 'ACCEPTED');
  const totalEarnings = acceptedBids.reduce((sum, bid) => sum + bid.price, 0);

  const stats = [
    {
      title: 'Available Jobs',
      value: availableJobs.length,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'My Bids',
      value: myBids.length,
      icon: Gavel,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Accepted Bids',
      value: acceptedBids.length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Earnings',
      value: `KES ${totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'My Vehicles',
      value: vehicles.length,
      icon: Car,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Rating',
      value: `${user?.rating || 0}/5`,
      icon: Star,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  if (jobsLoading || bidsLoading || vehiclesLoading) {
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
          Find loads, place bids, and grow your business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/jobs">
            <Card hover className="cursor-pointer border-primary-100 bg-primary-50">
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary-900">Find Available Loads</p>
                  <p className="text-sm text-primary-600">Browse and bid on jobs</p>
                </div>
                <Briefcase className="h-8 w-8 text-primary-500" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/vehicles/add">
            <Card hover className="cursor-pointer">
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Add Vehicle</p>
                  <p className="text-sm text-gray-500">Register your truck</p>
                </div>
                <Truck className="h-8 w-8 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
          <Link href="/bids/my">
            <Card hover className="cursor-pointer">
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">My Bids</p>
                  <p className="text-sm text-gray-500">Track your bids</p>
                </div>
                <Gavel className="h-8 w-8 text-gray-400" />
              </CardBody>
            </Card>
          </Link>
        </div>
      </div>

      {/* Available Jobs Section */}
      {availableJobs.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Available Loads</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableJobs.slice(0, 3).map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card hover className="cursor-pointer h-full">
                  <CardBody>
                    <div className="mb-2 flex items-start justify-between">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        BIDDING OPEN
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      {job.title || `From ${job.pickUpLocation}`}
                    </h3>
                    <p className="mb-2 text-sm text-gray-500 line-clamp-2">
                      {job.pickUpLocation} → {job.dropOffLocation}
                    </p>
                    {job.price && (
                      <p className="text-lg font-bold text-primary-600">
                        KES {job.price.toLocaleString()}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      Place Bid
                    </Button>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
          {availableJobs.length > 3 && (
            <div className="mt-4 text-center">
              <Link href="/jobs">
                <Button variant="ghost">View All Available Loads →</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}