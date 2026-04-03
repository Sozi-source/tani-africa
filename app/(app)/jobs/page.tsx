// app/(app)/jobs/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Package,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { DashboardLoader } from '../dashboard/components/DashboardLoader';
import { DashboardError } from '../dashboard/components/DashboardError';
import { Job } from '@/types';

export default function JobsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { jobs: jobsData, loading: jobsLoading, error: jobsError, refetch } = useJobs();
  
  // Ensure jobs is always an array
  const jobs = useMemo(() => Array.isArray(jobsData) ? jobsData : [], [jobsData]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    cargoType: '',
    location: ''
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Debug logging
  useEffect(() => {
    console.log('Jobs page - jobsData:', jobsData);
    console.log('Jobs page - is array:', Array.isArray(jobsData));
    console.log('Jobs page - jobs count:', jobs.length);
  }, [jobsData, jobs.length]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    if (!jobs.length) return [];
    
    let filtered = [...jobs];
    
    // Only show BIDDING jobs for drivers
    if (user?.role === 'DRIVER') {
      filtered = filtered.filter(job => job.status === 'BIDDING');
    }
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(term) ||
        job.pickUpLocation?.toLowerCase().includes(term) ||
        job.dropOffLocation?.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term)
      );
    }
    
    // Price range
    if (filters.minPrice) {
      filtered = filtered.filter(job => (job.price || 0) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(job => (job.price || 0) <= Number(filters.maxPrice));
    }
    
    // Cargo type
    if (filters.cargoType) {
      filtered = filtered.filter(job => 
        job.cargoType?.toLowerCase().includes(filters.cargoType.toLowerCase())
      );
    }
    
    // Location
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      filtered = filtered.filter(job => 
        job.pickUpLocation?.toLowerCase().includes(loc) ||
        job.dropOffLocation?.toLowerCase().includes(loc)
      );
    }
    
    return filtered;
  }, [jobs, searchTerm, filters, user?.role]);

  const addActiveFilter = (label: string) => {
    if (!activeFilters.includes(label)) {
      setActiveFilters([...activeFilters, label]);
    }
  };

  const removeActiveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
    
    if (filter.includes('Min Price')) setFilters(prev => ({ ...prev, minPrice: '' }));
    if (filter.includes('Max Price')) setFilters(prev => ({ ...prev, maxPrice: '' }));
    if (filter.includes('Cargo:')) setFilters(prev => ({ ...prev, cargoType: '' }));
    if (filter.includes('Location:')) setFilters(prev => ({ ...prev, location: '' }));
  };

  const clearAllFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', cargoType: '', location: '' });
    setSearchTerm('');
    setActiveFilters([]);
  };

  if (authLoading || jobsLoading) return <DashboardLoader />;
  
  if (!isAuthenticated) return null;
  
  if (jobsError) {
    return (
      <DashboardError 
        message={jobsError} 
        onRetry={() => refetch()} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-600 mt-1">
            Browse and bid on available transport jobs
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <span 
                  key={filter}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs"
                >
                  {filter}
                  <button onClick={() => removeActiveFilter(filter)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button 
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price (KES)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => {
                      setFilters({ ...filters, minPrice: e.target.value });
                      if (e.target.value) addActiveFilter(`Min Price: ${e.target.value}`);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price (KES)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => {
                      setFilters({ ...filters, maxPrice: e.target.value });
                      if (e.target.value) addActiveFilter(`Max Price: ${e.target.value}`);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="Max"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo Type
                  </label>
                  <input
                    type="text"
                    value={filters.cargoType}
                    onChange={(e) => {
                      setFilters({ ...filters, cargoType: e.target.value });
                      if (e.target.value) addActiveFilter(`Cargo: ${e.target.value}`);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="e.g., Electronics, Furniture"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => {
                      setFilters({ ...filters, location: e.target.value });
                      if (e.target.value) addActiveFilter(`Location: ${e.target.value}`);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                    placeholder="City or region"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No jobs found matching your criteria</p>
              <button 
                onClick={clearAllFilters}
                className="mt-3 text-sm text-primary-600 hover:underline"
              >
                Clear all filters
              </button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// JobCard Component (inline or separate file)
function JobCard({ job }: { job: Job }) {
  const router = useRouter();
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
      <CardBody className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {job.title || 'Transport Job'}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.status === 'BIDDING' ? 'bg-blue-100 text-blue-700' :
            job.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
            job.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {job.status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-600 text-sm">From: {job.pickUpLocation}</p>
              <p className="text-gray-600 text-sm">To: {job.dropOffLocation}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {job.cargoType && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">{job.cargoType}</span>
              </div>
            )}
            {job.cargoWeight && (
              <div className="flex items-center gap-1">
                <Package className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">{job.cargoWeight}kg</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600 font-medium">KES {job.price?.toLocaleString()}</span>
            </div>
            {job.scheduledDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {new Date(job.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}