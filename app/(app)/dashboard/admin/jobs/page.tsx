'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/lib/hooks/useAuth';
import { useJobs } from '@/lib/hooks/useJobs';

import {
  Job,
  JOB_STATUS_CONFIG,
  isJobVisibleToDrivers,
} from '@/types';

import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

import {
  Briefcase,
  MapPin,
  Calendar,
  Truck,
  AlertCircle,
} from 'lucide-react';

/* =====================================================
   Page Component
===================================================== */

export default function JobsPage() {
  const { user, isDriver, isClient, isAdmin } = useAuth();
  const { jobs, loading, fetchJobs } = useJobs();

  const [visibleJobs, setVisibleJobs] = useState<Job[]>([]);

  /* =====================================================
     Filter jobs based on role
  ===================================================== */

  useEffect(() => {
    if (!jobs.length) {
      setVisibleJobs([]);
      return;
    }

    let filtered: Job[] = [];

    if (isAdmin) {
      filtered = jobs;
    } else if (isClient) {
      filtered = jobs.filter(job => job.clientId === user?.id);
    } else if (isDriver) {
      filtered = jobs.filter(job => isJobVisibleToDrivers(job.status));
    }

    setVisibleJobs(filtered);
  }, [jobs, isAdmin, isClient, isDriver, user]);

  /* =====================================================
     Initial load safeguard
  ===================================================== */

  useEffect(() => {
    if (!jobs.length) {
      fetchJobs();
    }
  }, [jobs.length, fetchJobs]);

  /* =====================================================
     Loading / Empty States
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (visibleJobs.length === 0) {
    return (
      <div className="container-custom py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          No jobs available
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {isDriver
            ? 'There are no approved jobs available for bidding at the moment.'
            : isClient
            ? 'You have not posted any jobs yet.'
            : 'No jobs found.'}
        </p>
        {isClient && (
          <Link href="/jobs/create">
            <Button className="mt-4">Post a Job</Button>
          </Link>
        )}
      </div>
    );
  }

  /* =====================================================
     Render Jobs
  ===================================================== */

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleJobs.map(job => {
            const statusUI = JOB_STATUS_CONFIG[job.status];

            return (
              <Card
                key={job.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3 ${statusUI.color}`}
                    >
                      <span className="text-xs font-semibold">
                        {statusUI.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">
                      {job.title}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.pickUpLocation} → {job.dropOffLocation}
                      </div>

                      {job.scheduledDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </div>
                      )}

                      {job.price && (
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          Budget: KES {job.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link href={`/dashboard/admin/jobs/${job.id}`}>
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}