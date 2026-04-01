'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useJobs } from '@/lib/hooks/useJobs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardBody } from '@/components/ui/Card';
import { MapPin, Package, Clock, CheckCircle, Truck } from 'lucide-react';

// Dynamically import map to avoid SSR issues with Mapbox
const JobTrackingMap = dynamic(
  () => import('@/components/tracking/JobTrackingMap').then(m => m.JobTrackingMap),
  { ssr: false, loading: () => <div className="h-96 bg-gray-100 rounded-xl animate-pulse" /> },
);

const STATUS_STEPS = [
  { key: 'PENDING',    label: 'Posted',       icon: Package },
  { key: 'ACCEPTED',  label: 'Driver Assigned', icon: Truck },
  { key: 'PICKED_UP', label: 'Picked Up',     icon: MapPin },
  { key: 'IN_TRANSIT', label: 'In Transit',   icon: Truck },
  { key: 'DELIVERED', label: 'Delivered',     icon: CheckCircle },
];

export default function JobTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { getJobById } = useJobs();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getJobById(id).then(data => {
      setJob(data);
      setLoading(false);
    });
  }, [id, getJobById]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container-custom py-12 text-center text-gray-500">
        Job not found.
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === job.status);
  const showMap = ['PICKED_UP', 'IN_TRANSIT'].includes(job.status);

  return (
    <div className="container-custom py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Shipment</h1>
      <p className="text-gray-500 text-sm mb-6">Job #{job.id?.slice(0, 8).toUpperCase()}</p>

      {/* Status timeline */}
      <Card className="mb-6">
        <CardBody className="p-6">
          <div className="flex items-center justify-between relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary-500 z-0 transition-all duration-500"
              style={{
                width: currentStepIndex >= 0
                  ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`
                  : '0%',
              }}
            />

            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const done = index <= currentStepIndex;
              const current = index === currentStepIndex;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      done
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${current ? 'ring-4 ring-primary-100' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-medium text-center max-w-[60px] ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Live map (only when in transit) */}
      {showMap ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Driver Location
          </h2>
          <JobTrackingMap
            jobId={id}
            pickUpLocation={job.pickUpLocation}
            dropOffLocation={job.dropOffLocation}
            initialLat={job.driverLat ?? -1.2921}
            initialLng={job.driverLng ?? 36.8219}
          />
        </div>
      ) : (
        <Card className="mb-6 bg-gray-50">
          <CardBody className="py-8 text-center">
            <Truck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {job.status === 'PENDING' || job.status === 'ACCEPTED'
                ? 'Live tracking will appear once the driver picks up your cargo.'
                : 'Your shipment has been delivered.'}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Job details */}
      <Card>
        <CardBody className="p-6 space-y-3">
          <h2 className="font-semibold text-gray-800">Shipment Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-medium text-gray-900">{job.pickUpLocation}</p>
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-medium text-gray-900">{job.dropOffLocation}</p>
            </div>
            {job.cargoWeight && (
              <div>
                <p className="text-gray-500">Weight</p>
                <p className="font-medium text-gray-900">{job.cargoWeight} kg</p>
              </div>
            )}
            {job.price && (
              <div>
                <p className="text-gray-500">Price</p>
                <p className="font-medium text-gray-900">KES {job.price.toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}