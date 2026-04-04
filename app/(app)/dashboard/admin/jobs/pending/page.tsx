// app/(app)/admin/jobs/pending/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api/admin';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { PendingJob } from '@/types';

import {
  Eye,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';

import Link from 'next/link';
import toast from 'react-hot-toast';

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
      setJobs(data ?? []);
    } catch {
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
    job.pickUpLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.dropOffLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.client?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pending Job Approvals
            </h1>
            <p className="text-sm text-gray-500">
              Review and approve jobs posted by clients
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Pending: {jobs.length} jobs
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title, location, or client…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <p className="text-gray-600 font-medium">No pending jobs</p>
              <p className="text-sm text-gray-400">
                All jobs have been reviewed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border shadow-sm p-5 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.title || 'Transport Job'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {job.price !== undefined && (
                      <p className="text-lg font-bold text-orange-600">
                        KES {job.price.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {job.pickUpLocation}
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {job.dropOffLocation}
                    </div>
                    {job.scheduledDate && (
                      <div className="flex gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(job.scheduledDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between gap-3 border-t pt-3">
                    <Link href={`/admin/jobs/${job.id}`} className="flex-1">
                      <button className="w-full border rounded-lg py-2 text-sm hover:bg-gray-50">
                        <Eye className="inline h-4 w-4 mr-1" />
                        View
                      </button>
                    </Link>
                    <button
                      onClick={() => handleApprove(job.id)}
                      disabled={processingId === job.id}
                      className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowRejectModal(true);
                      }}
                      disabled={processingId === job.id}
                      className="flex-1 bg-red-50 text-red-600 rounded-lg py-2 text-sm hover:bg-red-100"
                    >
                      Reject
                    </button>
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