import { Job } from '@/types';

export function adaptJob(apiJob: any): Job {
  return {
    id: apiJob.id,
    title: apiJob.title ?? 'Transport Job',
    description: apiJob.description ?? null,

    status: apiJob.status,

    pickUpLocation: apiJob.pickUpLocation,
    dropOffLocation: apiJob.dropOffLocation,

    pickUpLatitude: apiJob.pickUpLatitude ?? null,
    pickUpLongitude: apiJob.pickUpLongitude ?? null,
    dropOffLatitude: apiJob.dropOffLatitude ?? null,
    dropOffLongitude: apiJob.dropOffLongitude ?? null,

    price: apiJob.price ?? null,

    clientId: apiJob.clientId,
    driverId: apiJob.driverId ?? null,

    createdAt: apiJob.createdAt,
    updatedAt: apiJob.updatedAt ?? apiJob.createdAt,
  };
}