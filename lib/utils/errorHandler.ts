// src/lib/utils/errorHandler.ts
import toast from 'react-hot-toast';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface AxiosErrorResponse {
  response?: {
    status: number;
    data: {
      message: string | string[];
      error?: string;
      statusCode?: number;
    };
  };
  code?: string;
  message?: string;
  config?: {
    url?: string;
    method?: string;
  };
}

export function handleApiError(error: unknown): string {
  const axiosError = error as AxiosErrorResponse;
  
  // Network error
  if (axiosError?.code === 'ERR_NETWORK') {
    toast.error('Network error. Please check your internet connection.');
    return 'Network error. Please check your internet connection.';
  }
  
  // Timeout error
  if (axiosError?.code === 'ECONNABORTED') {
    toast.error('Request timeout. Please try again.');
    return 'Request timeout. Please try again.';
  }
  
  // Server error
  if (axiosError?.response?.status === 500) {
    toast.error('Server error. Please try again later.');
    return 'Server error. Please try again later.';
  }
  
  // Authentication error
  if (axiosError?.response?.status === 401) {
    toast.error('Please login to continue.');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return 'Authentication required';
  }
  
  // Authorization error
  if (axiosError?.response?.status === 403) {
    toast.error('You don\'t have permission to perform this action.');
    return 'Permission denied';
  }
  
  // Not found error
  if (axiosError?.response?.status === 404) {
    toast.error('Resource not found.');
    return 'Resource not found';
  }
  
  // Validation error
  if (axiosError?.response?.data?.message) {
    const messages = Array.isArray(axiosError.response.data.message) 
      ? axiosError.response.data.message 
      : [axiosError.response.data.message];
    
    messages.forEach((msg: string) => toast.error(msg));
    return messages.join(', ');
  }
  
  // Default error
  const message = axiosError?.message || 'An unexpected error occurred';
  toast.error(message);
  return message;
}

export function formatErrorMessage(error: unknown): string {
  const axiosError = error as AxiosErrorResponse;
  
  if (axiosError?.response?.data?.message) {
    if (Array.isArray(axiosError.response.data.message)) {
      return axiosError.response.data.message.join(', ');
    }
    return axiosError.response.data.message;
  }
  
  if (axiosError?.message) return axiosError.message;
  
  return 'An unexpected error occurred';
}

export function getErrorStatus(error: unknown): number {
  const axiosError = error as AxiosErrorResponse;
  return axiosError?.response?.status || 500;
}

export function isNetworkError(error: unknown): boolean {
  const axiosError = error as AxiosErrorResponse;
  return axiosError?.code === 'ERR_NETWORK';
}

export function isTimeoutError(error: unknown): boolean {
  const axiosError = error as AxiosErrorResponse;
  return axiosError?.code === 'ECONNABORTED';
}

export function isAuthError(error: unknown): boolean {
  const axiosError = error as AxiosErrorResponse;
  return axiosError?.response?.status === 401;
}

export function isForbiddenError(error: unknown): boolean {
  const axiosError = error as AxiosErrorResponse;
  return axiosError?.response?.status === 403;
}

export function isNotFoundError(error: unknown): boolean {
  const axiosError = error as AxiosErrorResponse;
  return axiosError?.response?.status === 404;
}

export function isServerError(error: unknown): boolean {
  const axiosError = error as AxiosErrorResponse;
  return (axiosError?.response?.status ?? 0) >= 500;
}

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosErrorResponse;
  
  if (axiosError?.response?.data?.message) {
    if (Array.isArray(axiosError.response.data.message)) {
      return axiosError.response.data.message[0];
    }
    return axiosError.response.data.message;
  }
  
  if (axiosError?.message) return axiosError.message;
  
  return 'An unexpected error occurred';
}