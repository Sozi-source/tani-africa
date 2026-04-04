// app/(app)/admin/jobs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Eye, MapPin, Package, DollarSign, Calendar, User, 
  CheckCircle, XCircle, Clock, Search, AlertCircle,
  ChevronDown, RefreshCw, Mail
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Define Job interface with proper optional types
interface Job {
  id: string;
  title: string;
  description?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  cargoType?: string;
  cargoWeight?: number;
  price: number;
  status: string;
  clientId: string;
  client?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  driverId?: string;
  driver?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  scheduledDate?: string;
}

// Type guard functions
function isJobArray(value: unknown): value is Job[] {
  return Array.isArray(value);
}

function isApiResponseWithData(value: unknown): value is { data: Job[] } {
  return typeof value === 'object' && value !== null && 'data' in value && Array.isArray((value as { data: unknown }).data);
}

function isApiResponseWithJobs(value: unknown): value is { jobs: Job[] } {
  return typeof value === 'object' && value !== null && 'jobs' in value && Array.isArray((value as { jobs: unknown }).jobs);
}

function isApiResponseWithItems(value: unknown): value is { items: Job[] } {
  return typeof value === 'object' && value !== null && 'items' in value && Array.isArray((value as { items: unknown }).items);
}

function isApiResponseWithResults(value: unknown): value is { results: Job[] } {
  return typeof value === 'object' && value !== null && 'results' in value && Array.isArray((value as { results: unknown }).results);
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getAllJobs();
      console.log('Jobs response:', response);
      
      // Safely extract jobs array
      let jobsArray: Job[] = [];
      
      if (isJobArray(response)) {
        jobsArray = response;
      } else if (isApiResponseWithData(response)) {
        jobsArray = response.data;
      } else if (isApiResponseWithJobs(response)) {
        jobsArray = response.jobs;
      } else if (isApiResponseWithItems(response)) {
        jobsArray = response.items;
      } else if (isApiResponseWithResults(response)) {
        jobsArray = response.results;
      } else if (response && typeof response === 'object') {
        const arrayProperty = Object.values(response).find(Array.isArray);
        if (arrayProperty && isJobArray(arrayProperty)) {
          jobsArray = arrayProperty;
        }
      }
      
      // Normalize each job to ensure required fields have defaults
      const normalizedJobs = jobsArray.map((job) => ({
        id: job.id || '',
        title: job.title || 'Transport Job',
        price: job.price || 0,
        pickUpLocation: job.pickUpLocation || 'Not specified',
        dropOffLocation: job.dropOffLocation || 'Not specified',
        status: job.status || 'UNKNOWN',
        createdAt: job.createdAt || new Date().toISOString(),
        clientId: job.clientId || '',
        description: job.description,
        cargoType: job.cargoType,
        cargoWeight: job.cargoWeight,
        scheduledDate: job.scheduledDate,
        client: job.client,
        driverId: job.driverId,
        driver: job.driver,
      }));
      
      setJobs(normalizedJobs);
      
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load jobs';
      setError(errorMessage);
      toast.error(errorMessage);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(term) ||
        job.pickUpLocation.toLowerCase().includes(term) ||
        job.dropOffLocation.toLowerCase().includes(term) ||
        (job.client?.email || '').toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }
    
    if (statusFilter !== 'ALL' && job.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  // Status options for filter
  const statusOptions = [
    { value: 'ALL', label: 'All', count: jobs.length },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval', count: jobs.filter(j => j.status === 'PENDING_APPROVAL').length },
    { value: 'APPROVED', label: 'Approved', count: jobs.filter(j => j.status === 'APPROVED').length },
    { value: 'REJECTED', label: 'Rejected', count: jobs.filter(j => j.status === 'REJECTED').length },
    { value: 'BIDDING', label: 'Bidding', count: jobs.filter(j => j.status === 'BIDDING').length },
    { value: 'ACTIVE', label: 'Active', count: jobs.filter(j => j.status === 'ACTIVE').length },
    { value: 'COMPLETED', label: 'Completed', count: jobs.filter(j => j.status === 'COMPLETED').length },
    { value: 'CANCELLED', label: 'Cancelled', count: jobs.filter(j => j.status === 'CANCELLED').length },
  ];

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; bgColor: string }> = {
      PENDING_APPROVAL: { label: 'Pending Approval', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
      APPROVED: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-50' },
      REJECTED: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50' },
      BIDDING: { label: 'Bidding', color: 'text-blue-700', bgColor: 'bg-blue-50' },
      ACTIVE: { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-50' },
      COMPLETED: { label: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
      CANCELLED: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-50' },
    };
    const cfg = config[status] || { label: status || 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <p className="text-red-500 font-medium">{error}</p>
          <button 
            onClick={fetchJobs} 
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Jobs</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage all jobs on the platform</p>
              <p className="text-xs text-gray-400 mt-1">Total: {jobs.length} jobs</p>
            </div>
            <button 
              onClick={fetchJobs}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{jobs.filter(j => j.status === 'PENDING_APPROVAL').length}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{jobs.filter(j => j.status === 'ACTIVE').length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <Package className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold">{jobs.filter(j => j.status === 'COMPLETED').length}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold">KES {jobs.reduce((sum, j) => sum + j.price, 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Value</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, location, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-orange-500 focus:outline-none appearance-none"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No jobs found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getStatusBadge(job.status)}
                          <span className="text-xs text-gray-400">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                          {job.title}
                        </h3>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-orange-600">
                        KES {job.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Pickup:</p>
                          <p className="text-gray-500">{job.pickUpLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Dropoff:</p>
                          <p className="text-gray-500">{job.dropOffLocation}</p>
                        </div>
                      </div>
                      {job.cargoType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span>Cargo: {job.cargoType}{job.cargoWeight ? ` (${job.cargoWeight}kg)` : ''}</span>
                        </div>
                      )}
                      {job.scheduledDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Client Info */}
                    {job.client && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Client:</span>
                            <span>{job.client.firstName} {job.client.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">{job.client.email}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      
                        <button onClick={() => router.push(`/dashboard/admin/jobs/${job.id}`)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                     
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleBasedRoute>
  );
}