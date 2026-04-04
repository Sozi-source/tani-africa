// lib/mappers/jobMapper.ts

import { Job } from '@/types';
import { ApiJobStatus, normalizeJobStatus } from '@/types';

export function mapApiJob(apiJob: any): Job {
  const rawStatus = apiJob.status as ApiJobStatus;

  return {
    id: apiJob.id,
    title: apiJob.title ?? 'Transport Job',
    description: apiJob.description,

    pickUpLocation: apiJob.pickUpLocation ?? 'Not specified',
    dropOffLocation: apiJob.dropOffLocation ?? 'Not specified',

    pickUpLatitude: apiJob.pickUpLatitude,
    pickUpLongitude: apiJob.pickUpLongitude,
    dropOffLatitude: apiJob.dropOffLatitude,
    dropOffLongitude: apiJob.dropOffLongitude,

    cargoType: apiJob.cargoType,
    cargoWeight: apiJob.cargoWeight,
    price: apiJob.price,
    scheduledDate: apiJob.scheduledDate,

    // ✅ FIX
    apiStatus: rawStatus,
    status: normalizeJobStatus(rawStatus),

    clientId: apiJob.clientId,
    driverId: apiJob.driverId,
    client: apiJob.client,
    driver: apiJob.driver,

    bids: apiJob.bids,
    rejectionReason: apiJob.rejectionReason,
    approvedBy: apiJob.approvedBy,
    approvedAt: apiJob.approvedAt,
    reviewedBy: apiJob.reviewedBy,
    reviewedAt: apiJob.reviewedAt,

    createdAt: apiJob.createdAt,
    updatedAt: apiJob.updatedAt,
  };
}