export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photo?: string;
  role: 'ADMIN' | 'CLIENT' | 'DRIVER';
  rating?: number;
  totalTrips?: number;
  approvalStatus?: boolean;
  drivingLicense?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Job {
  id: string;
  status: 'SUBMITTED' | 'BIDDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
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

export interface Bid {
  id: string;
  price: number;
  estimatedDuration?: number;
  message?: string;
  status: 'SUBMITTED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  jobId: string;
  job?: Job;
  driverId: string;
  driver?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

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

export interface CreateVehicleData {
  category: string;
  plateNumber: string;
  capacity?: number;
  description?: string;
}

export interface CreateBidData {
  price: number;
  estimatedDuration?: number;
  message?: string;
  jobId: string;
}