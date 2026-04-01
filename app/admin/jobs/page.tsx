
'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminAPI } from '@/lib/api/admin';
import { Eye, Trash2, MapPin, DollarSign, Calendar, RefreshCw, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface AdminJob {
  id: string;
  title: string | null;
  pickUpLocation: string;
  dropOffLocation: string;
  price: number | null;
  status: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

type StatusType = 'all' | 'submitted' | 'bidding' | 'active' | 'completed' | 'cancelled';

const statusMap: Record<StatusType, string> = {
  all: 'ALL',
  submitted: 'SUBMITTED',
  bidding: 'BIDDING',
  active: 'ACTIVE',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllJobs();
      
      let jobsData: any[] = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          jobsData = response;
        } else if ('data' in response && Array.isArray((response as any).data)) {
          jobsData = (response as any).data;
        } else if ('jobs' in response && Array.isArray((response as any).jobs)) {
          jobsData = (response as any).jobs;
        } else if ('items' in response && Array.isArray((response as any).items)) {
          jobsData = (response as any).items;
        } else {
          jobsData = [response];
        }
      }
      
      const mappedJobs: AdminJob[] = jobsData.map((job: any) => ({
        id: job.id,
        title: job.title || null,
        pickUpLocation: job.pickUpLocation,
        dropOffLocation: job.dropOffLocation,
        price: job.price || null,
        status: job.status,
        client: job.client ? {
          firstName: job.client.firstName,
          lastName: job.client.lastName,
          email: job.client.email,
        } : null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }));
      
      setJobs(mappedJobs);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error(error?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await adminAPI.deleteJob(jobId);
        toast.success('Job deleted successfully');
        fetchJobs();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== statusMap[filter]) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (job.title?.toLowerCase().includes(searchLower) || false) ||
        job.pickUpLocation.toLowerCase().includes(searchLower) ||
        job.dropOffLocation.toLowerCase().includes(searchLower) ||
        (job.client?.email?.toLowerCase().includes(searchLower) || false) ||
        (job.client?.firstName?.toLowerCase().includes(searchLower) || false) ||
        (job.client?.lastName?.toLowerCase().includes(searchLower) || false)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      BIDDING: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      SUBMITTED: '📝',
      BIDDING: '💰',
      ACTIVE: '🚚',
      COMPLETED: '✅',
      CANCELLED: '❌',
    };
    return icons[status] || '📋';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SUBMITTED: 'Submitted',
      BIDDING: 'Bidding',
      ACTIVE: 'Active',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return labels[status] || status;
  };

  const stats = {
    total: jobs.length,
    submitted: jobs.filter(j => j.status === 'SUBMITTED').length,
    bidding: jobs.filter(j => j.status === 'BIDDING').length,
    active: jobs.filter(j => j.status === 'ACTIVE').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
    cancelled: jobs.filter(j => j.status === 'CANCELLED').length,
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
                <p className="mt-2 text-gray-600">View and manage all jobs on the platform</p>
              </div>
              <Button variant="outline" onClick={fetchJobs} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center border border-yellow-100">
              <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
              <p className="text-sm text-yellow-600">Submitted</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center border border-blue-100">
              <p className="text-2xl font-bold text-blue-600">{stats.bidding}</p>
              <p className="text-sm text-blue-600">Bidding</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center border border-green-100">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center border border-gray-100">
              <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center border border-red-100">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-red-600">Cancelled</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by title, location, or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-l-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`rounded-r-lg border border-l-0 border-gray-300 px-4 py-2 transition-colors ${
                    showFilters ? 'bg-primary-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
              
              {(filter !== 'all' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              )}
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'submitted', 'bidding', 'active', 'completed', 'cancelled'] as StatusType[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Jobs' : status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      filter === status ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {status === 'submitted' && stats.submitted}
                      {status === 'bidding' && stats.bidding}
                      {status === 'active' && stats.active}
                      {status === 'completed' && stats.completed}
                      {status === 'cancelled' && stats.cancelled}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-500">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No jobs found matching your criteria</p>
              {(filter !== 'all' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} hover>
                  <CardBody className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}>
                            <span>{getStatusIcon(job.status)}</span>
                            <span>{getStatusLabel(job.status)}</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          {job.title || `Job #${job.id.slice(-8)}`}
                        </h3>
                        <div className="mb-2 flex items-start text-sm text-gray-600">
                          <MapPin className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{job.pickUpLocation} → {job.dropOffLocation}</span>
                        </div>
                        {job.client && (
                          <div className="mb-2 text-sm text-gray-600">
                            Client: {job.client.firstName} {job.client.lastName} ({job.client.email})
                          </div>
                        )}
                        {job.price && (
                          <div className="flex items-center text-lg font-bold text-primary-600">
                            <DollarSign className="h-4 w-4" />
                            KES {job.price.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleDeleteJob(job.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleBasedRoute>
  );
}