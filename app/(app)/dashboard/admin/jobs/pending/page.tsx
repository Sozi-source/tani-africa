// app/(app)/admin/jobs/pending/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Eye, MapPin, Package, DollarSign, Calendar, User, 
  CheckCircle, XCircle, Clock, Search, AlertCircle,
  Truck, Building2, Phone, Mail, FileText
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PendingJob {
  id: string;
  title: string;
  description?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  cargoType?: string;
  cargoWeight?: number;
  price: number;
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  scheduledDate?: string;
}

export default function PendingJobsPage() {
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load pending jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    setProcessingId(jobId);
    try {
      await adminAPI.approveJob(jobId);
      toast.success('Job approved and now visible to drivers');
      fetchPendingJobs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve job');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedJob) return;
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setProcessingId(selectedJob.id);
    try {
      await adminAPI.rejectJob(selectedJob.id, rejectionReason);
      toast.success('Job rejected');
      setShowRejectModal(false);
      setSelectedJob(null);
      setRejectionReason('');
      fetchPendingJobs();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject job');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.pickUpLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.dropOffLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pending Job Approvals</h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve jobs posted by clients</p>
            <p className="text-xs text-gray-400 mt-1">Pending: {jobs.length} jobs</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <Clock className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{jobs.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <Package className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                KES {jobs.reduce((sum, j) => sum + (j.price || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Total Value</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <Building2 className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {new Set(jobs.map(j => j.clientId)).size}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Clients</p>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100">
              <Truck className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs sm:text-sm text-gray-500">Approved</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title, location, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <p className="text-gray-500 font-medium">No pending jobs</p>
              <p className="text-sm text-gray-400 mt-1">All jobs have been reviewed</p>
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            Pending Approval
                          </span>
                          <span className="text-xs text-gray-400">
                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                          {job.title || 'Transport Job'}
                        </h3>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-orange-600">
                        KES {job.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">Pickup:</p>
                          <p className="text-gray-500">{job.pickUpLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
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
                        {job.client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-500">{job.client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                      <Link href={`/admin/jobs/${job.id}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowRejectModal(true);
                        }}
                        disabled={processingId === job.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(job.id)}
                        disabled={processingId === job.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {processingId === job.id ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Job</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject <strong>{selectedJob.title || 'this job'}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedJob(null);
                  setRejectionReason('');
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedJob.id}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {processingId === selectedJob.id ? 'Processing...' : 'Reject Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleBasedRoute>
  );
}