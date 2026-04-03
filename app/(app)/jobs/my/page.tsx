// app/(app)/jobs/my/page.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { JobCard } from '@/components/jobs/JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  X,
  SlidersHorizontal,
  ChevronDown,
  Filter,
  TrendingUp,
  Wallet,
  Briefcase,
  Clock  // ✅ Added missing Clock import
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyJobsPage() {
  const { user } = useAuth();
  const { jobs, loading, error, refetch } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refetch();
  }, []);

  // Pull to refresh simulation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Safety check - ensure jobs is an array
  const jobsArray = Array.isArray(jobs) ? jobs : [];
  
  // Filter jobs for the current user
  const myJobs = jobsArray.filter(job => job.clientId === user?.id);
  
  // Apply filters
  const filteredJobs = myJobs.filter(job => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(searchLower) ||
        job.pickUpLocation?.toLowerCase().includes(searchLower) ||
        job.dropOffLocation?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (statusFilter !== 'ALL' && job.status !== statusFilter) return false;
    return true;
  });

  const activeJobs = myJobs.filter(job => 
    ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(job.status)
  );
  const completedJobs = myJobs.filter(job => job.status === 'COMPLETED');
  const cancelledJobs = myJobs.filter(job => job.status === 'CANCELLED');

  const statusOptions = [
    { value: 'ALL', label: 'All', count: myJobs.length, icon: Briefcase },
    { value: 'SUBMITTED', label: 'Pending', count: myJobs.filter(j => j.status === 'SUBMITTED').length, icon: Clock },
    { value: 'BIDDING', label: 'Bidding', count: myJobs.filter(j => j.status === 'BIDDING').length, icon: TrendingUp },
    { value: 'ACTIVE', label: 'Active', count: myJobs.filter(j => j.status === 'ACTIVE').length, icon: Package },
    { value: 'COMPLETED', label: 'Completed', count: completedJobs.length, icon: CheckCircle },
    { value: 'CANCELLED', label: 'Cancelled', count: cancelledJobs.length, icon: XCircle },
  ];

  const totalSpent = myJobs.reduce((sum, j) => sum + (j.price || 0), 0);
  const totalBids = myJobs.reduce((sum, j) => sum + (j.bids?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-primary-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-400 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500 font-medium">Loading shipments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load shipments</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{error}</p>
        <button 
          onClick={refetch}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-lg active:scale-95 transition-transform"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['CLIENT', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2">
            <div className="bg-white rounded-full px-4 py-1 shadow-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
              <span className="text-xs text-gray-600">Refreshing...</span>
            </div>
          </div>
        )}

        {/* Sticky Header with Search */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="px-4 py-3">
            {/* Title and Action Row */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Shipments</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {myJobs.length} total {myJobs.length === 1 ? 'shipment' : 'shipments'}
                </p>
              </div>
              <Link href="/jobs/create">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium text-sm shadow-lg active:scale-95 transition-transform">
                  <Plus className="h-4 w-4" />
                  Post
                </button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filter Chip Row */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  showFilters 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {(searchTerm || statusFilter !== 'ALL') && (
                  <span className="ml-0.5 w-4 h-4 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center">
                    {(searchTerm ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0)}
                  </span>
                )}
              </button>
              
              {statusOptions.slice(0, 4).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                    statusFilter === option.value
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {statusFilter === option.value && <CheckCircle className="h-3 w-3" />}
                  {option.label}
                  {option.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      statusFilter === option.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Expanded Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      {(searchTerm || statusFilter !== 'ALL') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                          }}
                          className="text-xs text-primary-600"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value)}
                            className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
                              statusFilter === option.value
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${
                                statusFilter === option.value ? 'text-white' : 'text-gray-500'
                              }`} />
                              <span className="text-sm font-medium">{option.label}</span>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              statusFilter === option.value
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {option.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid (Fixed) */}
        <div className="px-4 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-3">
            {/* Active Jobs Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-5 w-5 text-white/80" />
                  <span className="text-white/50 text-[10px] font-medium">Active</span>
                </div>
                <p className="text-2xl font-bold text-white">{activeJobs.length}</p>
                <p className="text-[10px] text-white/70 mt-1 font-medium">
                  {activeJobs.length === 1 ? 'in progress' : 'in progress'}
                </p>
              </div>
            </div>

            {/* Completed Jobs Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-3 shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-white/80" />
                  <span className="text-white/50 text-[10px] font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold text-white">{completedJobs.length}</p>
                <p className="text-[10px] text-white/70 mt-1 font-medium">
                  {completedJobs.length === 1 ? 'job done' : 'jobs done'}
                </p>
              </div>
            </div>

            {/* Cancelled Jobs Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-3 shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="h-5 w-5 text-white/80" />
                  <span className="text-white/50 text-[10px] font-medium">Cancelled</span>
                </div>
                <p className="text-2xl font-bold text-white">{cancelledJobs.length}</p>
                <p className="text-[10px] text-white/70 mt-1 font-medium">
                  {cancelledJobs.length === 1 ? 'job lost' : 'jobs lost'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-sm font-bold text-gray-900">KES {totalSpent.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Bids</p>
                  <p className="text-sm font-bold text-gray-900">{totalBids}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {(searchTerm || statusFilter !== 'ALL') && (
          <div className="px-4 mb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Found {filteredJobs.length} of {myJobs.length} shipments
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="text-xs text-primary-600 font-medium"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Jobs List - Native Card Design */}
        <div className="px-4 pb-20">
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {searchTerm || statusFilter !== 'ALL' ? (
                  <Search className="h-10 w-10 text-gray-400" />
                ) : (
                  <Package className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'ALL' ? 'No matching shipments' : 'No shipments yet'}
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters or search term'
                  : 'Post your first shipment to get started'}
              </p>
              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                  }}
                  className="mt-4 px-4 py-2 text-sm text-primary-600 font-medium"
                >
                  Clear all filters
                </button>
              )}
              {!searchTerm && statusFilter === 'ALL' && myJobs.length === 0 && (
                <Link href="/jobs/create">
                  <button className="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-lg active:scale-95 transition-transform">
                    Post Shipment
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard job={job} showActions={true} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Floating Action Button (Mobile) */}
        {filteredJobs.length > 0 && (
          <Link href="/jobs/create">
            <button className="fixed bottom-20 right-4 md:hidden w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform z-30">
              <Plus className="h-6 w-6" />
            </button>
          </Link>
        )}
      </div>
    </RoleBasedRoute>
  );
}