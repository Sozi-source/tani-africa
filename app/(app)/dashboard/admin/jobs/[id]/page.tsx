'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { jobsAPI } from '@/lib/api/jobs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardBody } from '@/components/ui/Card';

import {
  ArrowLeft,
  MapPin,
  Package,
  AlertCircle,
  Mail,
  Phone,
  Truck,
  User,
} from 'lucide-react';

/* ================= TYPES ================= */

type Person = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type JobDetails = {
  id: string;
  title: string;
  description?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  cargoType?: string;
  cargoWeight?: number;
  price: number;
  status: string;
  createdAt: string;
  scheduledDate?: string;
  client?: Person;
  driver?: Person;
};

/* ================= PAGE ================= */

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** prevents double fetch (Next.js strict mode) */
  const fetchedRef = useRef(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!jobId || fetchedRef.current) return;

    fetchedRef.current = true;
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await jobsAPI.getById(jobId);

      /* ✅ Normalize API response safely */
      const normalizedJob: JobDetails = {
        id: data?.id,
        title: data?.title ?? 'Transport Job',
        description: data?.description ?? '',
        pickUpLocation: data?.pickUpLocation ?? 'Not specified',
        dropOffLocation: data?.dropOffLocation ?? 'Not specified',
        cargoType: data?.cargoType ?? '',
        cargoWeight: data?.cargoWeight ?? 0,
        price: Number(data?.price ?? 0),
        status: data?.status ?? 'UNKNOWN',
        createdAt:
          data?.createdAt ?? new Date().toISOString(),
        scheduledDate: data?.scheduledDate,
        client: data?.client,
        driver: data?.driver,
      };

      setJob(normalizedJob);
    } catch (err: any) {
      console.error('Failed to fetch job:', err);
      setError(err?.message || 'Failed to load job');
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  /* ================= HELPERS ================= */

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      APPROVED: 'bg-green-50 text-green-700',
      PENDING_APPROVAL: 'bg-yellow-50 text-yellow-700',
      REJECTED: 'bg-red-50 text-red-700',
      ACTIVE: 'bg-blue-50 text-blue-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-50 text-red-700',
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          styles[status] ?? 'bg-gray-100 text-gray-700'
        }`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-500 font-medium">
          {error || 'Job not found'}
        </p>

        <Link
          href="/dashboard/admin/jobs"
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* BACK */}
        <Link
          href="/dashboard/admin/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        {/* HEADER */}
        <Card className="mb-6">
          <CardBody className="p-6 flex justify-between">
            <div>
              <div className="flex gap-2 mb-2">
                {getStatusBadge(job.status)}
                <span className="text-xs text-gray-400">
                  #{job.id.slice(-6)}
                </span>
              </div>

              <h1 className="text-2xl font-bold">
                {job.title}
              </h1>

              {job.description && (
                <p className="text-gray-600 mt-2">
                  {job.description}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Budget
              </p>
              <p className="text-2xl font-bold text-orange-600">
                KES {job.price.toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* ROUTE */}
        <Card>
          <CardBody className="p-6">
            <h2 className="font-semibold flex gap-2 mb-4">
              <MapPin className="h-5 w-5 text-orange-500" />
              Route Information
            </h2>

            <p>Pickup: {job.pickUpLocation}</p>
            <p className="mt-2">
              Dropoff: {job.dropOffLocation}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}