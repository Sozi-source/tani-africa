// ==================== USER TYPES ====================

export type UserRole = 'ADMIN' | 'CLIENT' | 'DRIVER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photo?: string;
  role: UserRole;
  rating?: number;
  totalTrips?: number;
  approvalStatus?: boolean;
  drivingLicense?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== VEHICLE TYPES ====================

export interface Vehicle {
  id: string;
  category: string;
  capacity?: number;
  plateNumber: string;
  photo?: string;
  description?: string;
  registrationDoc?: string;
  insuranceDoc?: string;
  isApproved: boolean;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleData {
  category: string;
  plateNumber: string;
  capacity?: number;
  description?: string;
  userId?: string;
}

// ==================== DRIVER APPLICATION TYPES ====================

export type VehicleCategory = keyof typeof VEHICLE_CATEGORIES;

export interface DriverApplication {
  id: string;
  userId: string;
  user?: User;
  licenseNumber: string;
  vehicleType?: VehicleCategory;
  experienceYears?: number;
  licenseDoc?: string;
  insuranceDoc?: string;
  registrationDoc?: string;
  additionalDocs?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  rejectionReason?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== ADMIN TYPES ====================

export interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalDrivers: number;
  pendingDrivers: number;
  totalJobs: number;
  pendingJobs: number;
  approvedJobs: number;
  rejectedJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
}

export interface PendingDriver {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    drivingLicense?: string;
    photo?: string;
    createdAt: string;
  };
  licenseNumber: string;
  vehicleType?: string;
  experienceYears?: number;
  documents?: {
    license?: string;
    insurance?: string;
    registration?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  notes?: string;
}

// ==================== JOB TYPES ====================

export type JobStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'BIDDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * ✅ ADDITION (NON-BREAKING)
 * Includes legacy / backend-only statuses
 */
export type ApiJobStatus =
  | JobStatus
  | 'SUBMITTED'; // legacy backend status

export interface Job {
  id: string;
  status: JobStatus;

  /**
   * ✅ ADDITION (OPTIONAL)
   * Raw backend status (if different from normalized status)
   */
  apiStatus?: ApiJobStatus;

  title: string;
  description?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  pickUpLatitude?: number;
  pickUpLongitude?: number;
  dropOffLatitude?: number;
  dropOffLongitude?: number;
  cargoType?: string;
  cargoWeight?: number;
  price?: number;
  scheduledDate?: string;
  clientId?: string;
  client?: User;
  driverId?: string;
  driver?: User;
  bids?: Bid[];
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  title?: string;
  description?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  cargoType?: string;
  cargoWeight?: number;
  price?: number;
  scheduledDate?: string;
  clientId: string;
}

export interface UpdateJobData extends Partial<CreateJobData> {
  status?: JobStatus;
  rejectionReason?: string;
}

// ==================== PENDING JOB TYPES ====================
export type PendingJob = Job & {
  status: 'PENDING_APPROVAL' | 'REJECTED';
};

// ==================== AUTH TYPES ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'CLIENT' | 'DRIVER';
  phone?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// ==================== BID TYPES ====================

export type BidStatus =
  | 'SUBMITTED'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Bid {
  id: string;
  price: number;
  estimatedDuration?: number;
  message?: string;
  status: BidStatus;
  jobId: string;
  job?: Job;
  driverId: string;
  driver?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBidData {
  price: number;
  estimatedDuration?: number;
  message?: string;
  jobId: string;
  driverId?: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== JOB STATUS CONFIG ====================

export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; icon: string; description: string }
> = {
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳',
    description: 'Awaiting admin review',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
    description: 'Ready for bidding',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
    description: 'Not approved',
  },
  BIDDING: {
    label: 'Bidding Open',
    color: 'bg-blue-100 text-blue-800',
    icon: '💰',
    description: 'Drivers can place bids',
  },
  ACTIVE: {
    label: 'In Progress',
    color: 'bg-green-100 text-green-800',
    icon: '🚚',
    description: 'Job in progress',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
    icon: '✅',
    description: 'Job completed',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
    description: 'Job cancelled',
  },
};

// ==================== BID STATUS CONFIG ====================

export const BID_STATUS_CONFIG: Record<
  BidStatus,
  { label: string; color: string; description: string }
> = {
  SUBMITTED: {
    label: 'Submitted',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Bid submitted',
  },
  PENDING: {
    label: 'Pending Review',
    color: 'bg-blue-100 text-blue-800',
    description: 'Awaiting client decision',
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800',
    description: 'Bid accepted',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    description: 'Bid not selected',
  },
  EXPIRED: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-800',
    description: 'Bid expired',
  },
};

// ==================== ROLE CONSTANTS ====================

export const ROLES = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  DRIVER: 'DRIVER',
} as const;

// ==================== VEHICLE CATEGORIES ====================

export const VEHICLE_CATEGORIES = {
  C1_LIGHT_TRUCK: 'Light Truck (up to 7.5 tons)',
  C_MEDIUM_TRUCK: 'Medium Truck (over 7.5 tons)',
  CE_HEAVY_TRUCK_TRAILER: 'Heavy Truck with Trailer',
  CD_HEAVY_GOODS_VEHICLE: 'Heavy Goods Vehicle',
  B2_LIGHT_MANUAL_VEHICLE: 'Light Manual Vehicle',
} as const;

// ==================== STATUS HELPERS ====================

export const normalizeJobStatus = (status: ApiJobStatus): JobStatus => {
  if (status === 'SUBMITTED') {
    return 'PENDING_APPROVAL';
  }
  return status;
};

export const isJobVisibleToDrivers = (status: JobStatus): boolean => {
  return ['APPROVED', 'BIDDING', 'ACTIVE'].includes(status);
};

export const canDriverBid = (status: JobStatus): boolean => {
  return status === 'APPROVED' || status === 'BIDDING';
};

export const getJobStatusFlow = (): { from: JobStatus; to: JobStatus[] }[] => {
  return [
    { from: 'PENDING_APPROVAL', to: ['APPROVED', 'REJECTED'] },
    { from: 'APPROVED', to: ['BIDDING', 'CANCELLED'] },
    { from: 'BIDDING', to: ['ACTIVE', 'CANCELLED'] },
    { from: 'ACTIVE', to: ['COMPLETED', 'CANCELLED'] },
  ];
};