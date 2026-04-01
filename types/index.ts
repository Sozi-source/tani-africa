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

export interface CreateDriverApplicationData {
  licenseNumber: string;
  vehicleType?: VehicleCategory;
  experienceYears?: number;
  licenseDoc?: string;
  insuranceDoc?: string;
  registrationDoc?: string;
  additionalDocs?: any;
}

// ==================== ADMIN TYPES ====================

export interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalDrivers: number;
  pendingDrivers: number;
  totalJobs: number;
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

export type JobStatus = 'SUBMITTED' | 'BIDDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Job {
  id: string;
  status: JobStatus;
  title?: string;
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
  clientId: string;
  client?: User;
  driverId?: string;
  driver?: User;
  bids?: Bid[];
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
}

// ==================== BID TYPES ====================

export type BidStatus = 'SUBMITTED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

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

// ==================== AUTH TYPES ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ==================== FEATURE TYPES ====================

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureData {
  title: string;
  description: string;
  icon: string;
  color: string;
  order?: number;
}

export interface UpdateFeatureData extends Partial<CreateFeatureData> {
  isActive?: boolean;
}

// ==================== TESTIMONIAL TYPES ====================

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialData {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface UpdateTestimonialData extends Partial<CreateTestimonialData> {
  isActive?: boolean;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  totalDeliveries: number;
  totalDrivers: number;
  satisfactionRate: number;
  activeJobs: number;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  userId: string;
  jobId?: string;
  bidId?: string;
}

// ==================== CONSTANTS ====================

export const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string; icon: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
  BIDDING: { label: 'Bidding Open', color: 'bg-blue-100 text-blue-800', icon: '💰' },
  ACTIVE: { label: 'In Progress', color: 'bg-green-100 text-green-800', icon: '🚚' },
  COMPLETED: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: '✅' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

export const BID_STATUS_CONFIG: Record<BidStatus, { label: string; color: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800' },
  PENDING: { label: 'Pending Review', color: 'bg-blue-100 text-blue-800' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-800' },
};

export const ROLES = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  DRIVER: 'DRIVER',
} as const;

export const VEHICLE_CATEGORIES = {
  C1_LIGHT_TRUCK: 'Light Truck (up to 7.5 tons)',
  C_MEDIUM_TRUCK: 'Medium Truck (over 7.5 tons)',
  CE_HEAVY_TRUCK_TRAILER: 'Heavy Truck with Trailer',
  CD_HEAVY_GOODS_VEHICLE: 'Heavy Goods Vehicle',
  B2_LIGHT_MANUAL_VEHICLE: 'Light Manual Vehicle',
} as const;