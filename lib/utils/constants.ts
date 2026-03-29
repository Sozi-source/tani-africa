export const JOB_STATUS = {
  SUBMITTED: 'SUBMITTED',
  BIDDING: 'BIDDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const BID_STATUS = {
  SUBMITTED: 'SUBMITTED',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export const VEHICLE_CATEGORIES: Record<string, string> = {
  C1_LIGHT_TRUCK: 'Light Truck (up to 7.5 tons)',
  C_MEDIUM_TRUCK: 'Medium Truck (over 7.5 tons)',
  CE_HEAVY_TRUCK_TRAILER: 'Heavy Truck with Trailer',
  CD_HEAVY_GOODS_VEHICLE: 'Heavy Goods Vehicle',
  B2_LIGHT_MANUAL_VEHICLE: 'Light Manual Vehicle',
};

export const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  BIDDING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

export type JobStatus = keyof typeof JOB_STATUS;
export type BidStatus = keyof typeof BID_STATUS;