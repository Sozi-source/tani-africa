'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';
import { useBids } from '@/lib/hooks/useBids';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Package, 
  Truck,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Gavel,
  Send,
  Weight,
  Info,
  TrendingUp,
  Shield,
  Star,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Bid form schema
const bidSchema = z.object({
  price: z.number().min(100, 'Price must be at least KES 100'),
  estimatedDuration: z.number().min(1, 'Duration must be at least 1 hour').optional(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

type BidFormData = z.infer<typeof bidSchema>;

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isDriver, isClient, isAdmin } = useAuth();
  const { getJobById, updateJobStatus } = useJobs();
  const { getBidsByJob, updateBidStatus, placeBid } = useBids();
  
  const [job, setJob] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [acceptingBid, setAcceptingBid] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      price: undefined,
      estimatedDuration: undefined,
      message: '',
    },
  });

  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const jobData = await getJobById(jobId);
      setJob(jobData);
      
      if (isClient || isAdmin) {
        const bidsData = await getBidsByJob(jobId);
        setBids(bidsData);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitBid = async (data: BidFormData) => {
    setSubmittingBid(true);
    try {
      await placeBid({
        price: data.price,
        estimatedDuration: data.estimatedDuration,
        message: data.message,
        jobId,
      });
      toast.success('Bid placed successfully!');
      setShowBidForm(false);
      reset();
      await fetchJobDetails();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to place bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId: string, driverId: string) => {
    if (!confirm('Accept this bid? The job will be assigned to this driver.')) return;
    
    setAcceptingBid(true);
    try {
      await updateBidStatus(bidId, 'ACCEPTED');
      await updateJobStatus(jobId, 'ACTIVE');
      toast.success('Bid accepted! Driver has been assigned.');
      await fetchJobDetails();
    } catch (error) {
      toast.error('Failed to accept bid');
    } finally {
      setAcceptingBid(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
      SUBMITTED: { 
        label: 'Pending Review', 
        color: 'text-yellow-800', 
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: <Clock className="h-4 w-4" /> 
      },
      BIDDING: { 
        label: 'Bidding Open', 
        color: 'text-blue-800', 
        bgColor: 'bg-blue-50 border-blue-200',
        icon: <Gavel className="h-4 w-4" /> 
      },
      ACTIVE: { 
        label: 'In Progress', 
        color: 'text-green-800', 
        bgColor: 'bg-green-50 border-green-200',
        icon: <Truck className="h-4 w-4" /> 
      },
      COMPLETED: { 
        label: 'Completed', 
        color: 'text-gray-800', 
        bgColor: 'bg-gray-50 border-gray-200',
        icon: <CheckCircle className="h-4 w-4" /> 
      },
      CANCELLED: { 
        label: 'Cancelled', 
        color: 'text-red-800', 
        bgColor: 'bg-red-50 border-red-200',
        icon: <XCircle className="h-4 w-4" /> 
      },
    };
    return config[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-50', icon: null };
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-custom py-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Job Not Found</h2>
        <p className="mt-2 text-gray-600">The job you're looking for doesn't exist.</p>
        <Link href="/jobs">
          <Button className="mt-4">Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(job.status);
  const canPlaceBid = isDriver && job.status === 'BIDDING';
  const canAcceptBids = isClient && job.status === 'BIDDING';
  const isMyJob = isClient && job.clientId === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Details Card */}
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardBody className="p-6">
                {/* Header with Status Badge */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${statusConfig.bgColor}`}>
                        {statusConfig.icon}
                        <span className={`text-xs font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {job.title || 'Transport Job'}
                    </h1>
                  </div>
                  {job.price && (
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 text-center min-w-[140px]">
                      <p className="text-xs text-primary-600 font-medium">Budget</p>
                      <p className="text-2xl font-bold text-primary-600">
                        KES {job.price.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
                  </div>
                )}

                {/* Location Details - Enhanced */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Pickup Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {job.pickUpLocation}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Dropoff Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      {job.dropOffLocation}
                    </p>
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {job.cargoType && (
                    <div className="rounded-lg bg-gray-50 p-3 text-center hover:bg-gray-100 transition-colors">
                      <Package className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Cargo Type</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{job.cargoType}</p>
                    </div>
                  )}
                  {job.cargoWeight && (
                    <div className="rounded-lg bg-gray-50 p-3 text-center hover:bg-gray-100 transition-colors">
                      <Weight className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-sm font-medium text-gray-900">{job.cargoWeight} kg</p>
                    </div>
                  )}
                  {job.scheduledDate && (
                    <div className="rounded-lg bg-gray-50 p-3 text-center hover:bg-gray-100 transition-colors">
                      <Calendar className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Scheduled</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(job.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg bg-gray-50 p-3 text-center hover:bg-gray-100 transition-colors">
                    <TrendingUp className="h-4 w-4 text-primary-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Bids</p>
                    <p className="text-sm font-medium text-gray-900">{bids.length}</p>
                  </div>
                </div>

                {/* Client Info - Enhanced */}
                {job.client && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold">
                        {job.client.firstName?.[0]}{job.client.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Posted by</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {job.client.firstName} {job.client.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{job.client.email}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">4.8</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Admin Controls - Open for Bidding */}
            {isAdmin && job.status === 'SUBMITTED' && (
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-md">
                <CardBody className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-yellow-100 p-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800">Job Pending Approval</p>
                        <p className="text-sm text-yellow-700">Open this job for drivers to place bids</p>
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          await updateJobStatus(job.id, 'BIDDING');
                          toast.success('Job opened for bidding!');
                          fetchJobDetails();
                        } catch (error) {
                          toast.error('Failed to update status');
                        }
                      }}
                      variant="primary"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Open for Bidding
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Driver Message - When Job is Not Bidding */}
            {isDriver && job.status !== 'BIDDING' && (
              <Card className="border-gray-200 bg-gray-50">
                <CardBody className="p-6 text-center">
                  <div className="rounded-full bg-gray-100 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {job.status === 'SUBMITTED' ? 'Awaiting Approval' : 'Bidding Closed'}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {job.status === 'SUBMITTED' 
                      ? 'This job is being reviewed by our team and will be available for bidding soon. Check back later!'
                      : 'This job is no longer accepting bids. Browse other available jobs.'}
                  </p>
                  <Link href="/jobs">
                    <Button variant="outline" className="mt-4">
                      Browse Other Jobs
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            )}

            {/* Bids Section (Client View) */}
            {canAcceptBids && isMyJob && (
              <Card className="shadow-lg">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Gavel className="h-5 w-5 text-primary-500" />
                      Bids Received ({bids.length})
                    </h2>
                    {bids.length > 0 && (
                      <span className="text-xs text-gray-400">Lowest bid wins</span>
                    )}
                  </div>
                  
                  {bids.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="rounded-full bg-gray-100 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No bids yet</p>
                      <p className="text-xs text-gray-400 mt-1">Drivers will bid on your job soon</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bids
                        .sort((a, b) => a.price - b.price)
                        .map((bid, index) => (
                          <div 
                            key={bid.id} 
                            className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                              index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-bold">
                                    {bid.driver?.firstName?.[0]}{bid.driver?.lastName?.[0]}
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {bid.driver?.firstName} {bid.driver?.lastName}
                                  </span>
                                  {index === 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                      <TrendingUp className="h-3 w-3" />
                                      Lowest Bid
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {new Date(bid.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-2xl font-bold text-primary-600">
                                    KES {bid.price.toLocaleString()}
                                  </span>
                                  {bid.estimatedDuration && (
                                    <span className="text-gray-500 text-xs flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {bid.estimatedDuration} hours
                                    </span>
                                  )}
                                </div>
                                {bid.message && (
                                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg italic">
                                    "{bid.message}"
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAcceptBid(bid.id, bid.driverId)}
                                loading={acceptingBid}
                                className="text-sm px-4 py-2"
                              >
                                Accept Bid
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Assigned Driver Section */}
            {job.status === 'ACTIVE' && job.driver && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md">
                <CardBody className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800">Driver Assigned!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        {job.driver.firstName} {job.driver.lastName} has been assigned to this job.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-100 rounded-lg p-2 inline-block">
                        <Shield className="h-3 w-3" />
                        Contact: {job.driver.email}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Column - Bid Form */}
          <div className="lg:col-span-1">
            {canPlaceBid ? (
              !showBidForm ? (
                <Card className="sticky top-24 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardBody className="p-6 text-center">
                    <div className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Gavel className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Bid?</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Place your offer and get this job
                    </p>
                    <Button
                      onClick={() => setShowBidForm(true)}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Place a Bid
                    </Button>
                  </CardBody>
                </Card>
              ) : (
                <Card className="sticky top-24 shadow-xl">
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Place Your Bid</h3>
                      <button
                        onClick={() => setShowBidForm(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmitBid)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Price (KES) *
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 25000"
                          {...register('price', { valueAsNumber: true })}
                          error={errors.price?.message}
                          className="w-full"
                        />
                        <p className="mt-1 text-xs text-gray-500">Minimum bid: KES 100</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Duration (hours)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 4"
                          {...register('estimatedDuration', { valueAsNumber: true })}
                          error={errors.estimatedDuration?.message}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message to Client
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Explain why you're the best fit..."
                          {...register('message')}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                        )}
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBidForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          loading={submittingBid}
                          className="flex-1"
                        >
                          Submit Bid
                        </Button>
                      </div>
                    </form>
                  </CardBody>
                </Card>
              )
            ) : null}

            {/* Quick Tips - Always visible when not in bid form */}
            {(!canPlaceBid || (canPlaceBid && !showBidForm)) && (
              <Card className="mt-4 shadow-md">
                <CardBody className="p-5">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary-500" />
                    Quick Tips
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1" />
                      <span>Research market rates before bidding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1" />
                      <span>Consider distance and cargo weight</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1" />
                      <span>Be specific about your availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1" />
                      <span>Respond quickly to increase chances</span>
                    </li>
                  </ul>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}