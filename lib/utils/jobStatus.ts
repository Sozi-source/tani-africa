/* =====================================================
   JOB STATUS — DOMAIN (CANONICAL)
===================================================== */

/**
 * ✅ Core Job lifecycle statuses used by the application.
 * These drive UI, permissions, dashboards, and workflows.
 */
export type JobStatus =
  | 'PENDING_APPROVAL'   // Client posted, awaiting admin review
  | 'APPROVED'           // Approved by admin (pre-bidding)
  | 'REJECTED'           // Admin rejected
  | 'BIDDING'            // Open for driver bids
  | 'ACTIVE'             // Driver assigned / job in progress
  | 'COMPLETED'          // Job completed
  | 'CANCELLED';         // Job cancelled at any stage

/* =====================================================
   JOB STATUS — API / LEGACY (ADDITIVE)
===================================================== */

/**
 * ✅ Backend / legacy statuses that may appear in API responses
 * but are NOT part of the core domain lifecycle.
 *
 * IMPORTANT:
 * - These values should NEVER be used directly by the UI.
 * - They MUST be normalized before entering the app state.
 */
export type ApiJobStatus =
  | JobStatus
  | 'SUBMITTED'; // legacy backend state

/* =====================================================
   NORMALIZATION
===================================================== */

/**
 * ✅ Converts any API / legacy job status into a valid JobStatus.
 * This function is the ONLY place where legacy statuses are handled.
 */
export const normalizeJobStatus = (status: ApiJobStatus): JobStatus => {
  switch (status) {
    case 'SUBMITTED':
      // Legacy backend state → canonical lifecycle
      return 'PENDING_APPROVAL';

    default:
      return status;
  }
};

/* =====================================================
   TYPE GUARDS
===================================================== */

/**
 * ✅ Runtime guard for legacy job status values.
 */
export const isLegacyJobStatus = (status: string): status is 'SUBMITTED' => {
  return status === 'SUBMITTED';
};

/**
 * ✅ Runtime guard for canonical JobStatus values.
 */
export const isJobStatus = (status: string): status is JobStatus => {
  return [
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'BIDDING',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
  ].includes(status);
};

/* =====================================================
   UI CONFIGURATION
===================================================== */

/**
 * ✅ Centralized UI configuration for job statuses.
 * Ensures exhaustiveness at compile time.
 */
export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  {
    label: string;
    color: string;
    icon: string;
    description: string;
  }
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
    description: 'Approved by admin, ready for bidding',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
    description: 'Job was rejected by admin',
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
    description: 'Job currently in progress',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
    icon: '✅',
    description: 'Job successfully completed',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: '❌',
    description: 'Job was cancelled',
  },
};

/* =====================================================
   DOMAIN HELPERS
===================================================== */

/**
 * ✅ Determines if a job should be visible to drivers.
 */
export const isJobVisibleToDrivers = (status: JobStatus): boolean => {
  return status === 'APPROVED' || status === 'BIDDING' || status === 'ACTIVE';
};

/**
 * ✅ Determines if drivers are allowed to place bids.
 */
export const canDriverBid = (status: JobStatus): boolean => {
  return status === 'APPROVED' || status === 'BIDDING';
};

/**
 * ✅ Determines if a job is awaiting admin action.
 */
export const isJobPendingAdminReview = (status: JobStatus): boolean => {
  return status === 'PENDING_APPROVAL';
};

/**
 * ✅ Defines valid job lifecycle transitions.
 * Useful for admin panels, guards, and testing.
 */
export const getJobStatusFlow = (): { from: JobStatus; to: JobStatus[] }[] => {
  return [
    { from: 'PENDING_APPROVAL', to: ['APPROVED', 'REJECTED'] },
    { from: 'APPROVED', to: ['BIDDING', 'CANCELLED'] },
    { from: 'BIDDING', to: ['ACTIVE', 'CANCELLED'] },
    { from: 'ACTIVE', to: ['COMPLETED', 'CANCELLED'] },
  ];
};