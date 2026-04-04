'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';

import {
  Job,
  Bid,
  JOB_STATUS_CONFIG,
  canDriverBid,
} from '@/types';

import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import {
  ArrowLeft,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

/* =====================================================
   Bid Form Schema
===================================================== */

const bidSchema = z.object({
  price: z.number().min(100, 'Minimum bid is KES 100'),
  estimatedDuration: z.number().min(1).optional(),
  message: z.string().max(500).optional(),
});

type BidFormData = z.infer<typeof bidSchema>;

/* =====================================================
   Page Component
===================================================== */

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { user, isDriver, isClient, isAdmin } = useAuth();
  const { getJobById, updateJobStatus } = useJobs();
  const { getBidsByJob, placeBid, updateBidStatus } = useBids();

  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [processingAdmin, setProcessingAdmin] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
  });

  /* =====================================================
     Fetch job + bids safely
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const jobData = await getJobById(jobId);
        if (!jobData || cancelled) return;

        setJob(jobData);

        if ((isClient || isAdmin) && jobData.id) {
          const bidsData = await getBidsByJob(jobData.id);
          if (!cancelled) setBids(bidsData);
        }
      } catch {
        toast.error('Failed to load job');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId, isClient, isAdmin, getJobById, getBidsByJob]);

  /* =====================================================
     Derived state
  ===================================================== */

  const canBid =
    isDriver &&
    job?.status === 'BIDDING' &&
    canDriverBid(job.status);

  const hasAlreadyBid =
    isDriver && bids.some(b => b.driverId === user?.id);

  const canAcceptBids =
    isClient && job?.status === 'BIDDING';

  const isOwner =
    isClient && job?.clientId === user?.id;

  /* =====================================================
     Actions
  ===================================================== */

  const submitBid = async (data: BidFormData) => {
    if (!job || job.status !== 'BIDDING') {
      toast.error('Bidding is not open for this job');
      return;
    }

    if (hasAlreadyBid) {
      toast.error('You already placed a bid on this job');
      return;
    }

    setSubmittingBid(true);
    try {
      await placeBid({
        jobId,
        price: data.price,
        estimatedDuration: data.estimatedDuration,
        message: data.message,
      });

      toast.success('Bid placed successfully');
      reset();
      setShowBidForm(false);

      setBids(await getBidsByJob(jobId));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to place bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const acceptBid = async (bidId: string) => {
    if (!confirm('Accept this bid and assign the driver?')) return;

    try {
      await updateBidStatus(bidId, 'ACCEPTED');
      await updateJobStatus(jobId, 'ACTIVE');
      toast.success('Bid accepted');

      setJob(await getJobById(jobId));
      setBids(await getBidsByJob(jobId));
    } catch {
      toast.error('Failed to accept bid');
    }
  };

  const approveJob = async () => {
    if (!confirm('Approve this job and open bidding?')) return;

    setProcessingAdmin(true);
    try {
      await updateJobStatus(jobId, 'BIDDING');
      toast.success('Job approved and opened for bidding');
      setJob(await getJobById(jobId));
    } catch {
      toast.error('Approval failed');
    } finally {
      setProcessingAdmin(false);
    }
  };

  const rejectJob = async () => {
    if (!confirm('Reject this job?')) return;

    setProcessingAdmin(true);
    try {
      await updateJobStatus(jobId, 'REJECTED', { rejectionReason });
      toast.success('Job rejected');
      setJob(await getJobById(jobId));
    } catch {
      toast.error('Rejection failed');
    } finally {
      setProcessingAdmin(false);
    }
  };

  /* =====================================================
     Loading / Not Found
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold">Job not found</h2>
        <Link href="/jobs">
          <Button className="mt-4">Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  const statusUI = JOB_STATUS_CONFIG[job.status];

  /* =====================================================
     Render
  ===================================================== */

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardBody className="p-6">
                <div className="flex justify-between mb-6">
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${statusUI.color}`}>
                      <span className="text-xs font-semibold">{statusUI.label}</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-3">
                      {job.title ?? 'Transport Job'}
                    </h1>
                  </div>

                  {job.price && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-xl font-bold">
                        KES {job.price.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {job.description && (
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 font-semibold mb-1">
                      <FileText className="h-4 w-4" />
                      Description
                    </h3>
                    <p className="text-sm text-gray-600">{job.description}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg flex gap-2 items-center">
                    <MapPin className="h-4 w-4" />
                    {job.pickUpLocation}
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg flex gap-2 items-center">
                    <MapPin className="h-4 w-4" />
                    {job.dropOffLocation}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* ADMIN APPROVAL */}
            {isAdmin && job.status === 'PENDING_APPROVAL' && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardBody className="p-6 space-y-4">
                  <h3 className="font-semibold text-yellow-800">
                    Admin Approval Required
                  </h3>

                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="Optional rejection reason"
                  />

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      loading={processingAdmin}
                      className="border-red-300 text-red-700"
                      onClick={rejectJob}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button loading={processingAdmin} onClick={approveJob}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Open for Bidding
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* CLIENT BIDS */}
            {canAcceptBids && isOwner && (
              <Card>
                <CardBody className="p-6">
                  <h3 className="font-semibold mb-4">
                    Bids ({bids.length})
                  </h3>

                  {bids.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No bids yet
                    </p>
                  )}

                  {bids
                    .sort((a, b) => a.price - b.price)
                    .map(bid => (
                      <div
                        key={bid.id}
                        className="border rounded-lg p-4 flex justify-between items-center mb-3"
                      >
                        <div>
                          <p className="font-medium">
                            {bid.driver?.firstName} {bid.driver?.lastName}
                          </p>
                          <p className="text-sm">
                            KES {bid.price.toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => acceptBid(bid.id)}>
                          Accept
                        </Button>
                      </div>
                    ))}
                </CardBody>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {canBid && !hasAlreadyBid && (
              <Card className="sticky top-24">
                <CardBody className="p-6">
                  {!showBidForm ? (
                    <Button className="w-full" onClick={() => setShowBidForm(true)}>
                      Place Bid
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmit(submitBid)} className="space-y-4">
                      <Input
                        type="number"
                        placeholder="Bid amount"
                        {...register('price', { valueAsNumber: true })}
                        error={errors.price?.message}
                      />
                      <Input
                        type="number"
                        placeholder="Estimated duration (hours)"
                        {...register('estimatedDuration', { valueAsNumber: true })}
                      />
                      <textarea
                        rows={3}
                        placeholder="Message (optional)"
                        className="w-full border rounded-lg p-2 text-sm"
                        {...register('message')}
                      />

                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setShowBidForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" loading={submittingBid}>
                          Submit Bid
                        </Button>
                      </div>
                    </form>
                  )}
                </CardBody>
              </Card>
            )}

            {hasAlreadyBid && (
              <p className="text-sm text-gray-500 mt-4">
                You have already placed a bid on this job.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}