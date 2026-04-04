// app/(app)/jobs/page.tsx - Updated to show only approved jobs
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/lib/hooks/useJobs';
import { useRouter } from 'next/navigation';
import { JobCard } from '@/components/jobs/JobCard';
import { DashboardLoader } from '@/app/(app)/dashboard/components/DashboardLoader';
import { DashboardError } from '@/app/(app)/dashboard/components/DashboardError';
import { Search, Filter, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Job } from '@/types';

// Helper to check if job is visible to drivers
const isJobVisibleToDrivers = (job: Job): boolean => {
  return ['APPROVED', 'BIDDING', 'ACTIVE'].includes(job.status);
};

export default function JobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { jobs: allJobs, loading, error, refetch } = useJobs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    cargoType: '',
    location: ''
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter jobs - Only show jobs that are visible to drivers
  const jobs = useMemo(() => {
    const jobsArray = Array.isArray(allJobs) ? allJobs : [];
    return jobsArray.filter(isJobVisibleToDrivers);
  }, [allJobs]);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    if (!jobs.length) return [];
    
    let filtered = [...jobs];
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(term) ||
        job.pickUpLocation?.toLowerCase().includes(term) ||
        job.dropOffLocation?.toLowerCase().includes(term)
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
  }, [jobs, searchTerm, filters]);

  if (loading) return <DashboardLoader />;
  if (error) return <DashboardError message={error} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse and bid on available transport jobs
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <span 
                  key={filter}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs"
                >
                  {filter}
                  <button onClick={() => {
                    setActiveFilters(activeFilters.filter(f => f !== filter));
                    if (filter.includes('Min')) setFilters(prev => ({ ...prev, minPrice: '' }));
                    if (filter.includes('Max')) setFilters(prev => ({ ...prev, maxPrice: '' }));
                    if (filter.includes('Cargo:')) setFilters(prev => ({ ...prev, cargoType: '' }));
                    if (filter.includes('Location:')) setFilters(prev => ({ ...prev, location: '' }));
                  }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button 
                onClick={() => {
                  setFilters({ minPrice: '', maxPrice: '', cargoType: '', location: '' });
                  setSearchTerm('');
                  setActiveFilters([]);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price (KES)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => {
                      setFilters({ ...filters, minPrice: e.target.value });
                      if (e.target.value) setActiveFilters([...activeFilters, `Min: ${e.target.value}`]);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
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
                      if (e.target.value) setActiveFilters([...activeFilters, `Max: ${e.target.value}`]);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
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
                      if (e.target.value) setActiveFilters([...activeFilters, `Cargo: ${e.target.value}`]);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="e.g., Electronics"
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
                      if (e.target.value) setActiveFilters([...activeFilters, `Location: ${e.target.value}`]);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="City or region"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No jobs available</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} showBidButton={user?.role === 'DRIVER'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}