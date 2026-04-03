// app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Truck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Users, UserCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

// Test accounts for development
const TEST_ACCOUNTS = [
  {
    id: 1,
    role: 'ADMIN',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    icon: Shield,
    color: 'purple',
    description: 'Full platform access',
  },
  {
    id: 2,
    role: 'DRIVER',
    name: 'Driver User',
    email: 'driver@example.com',
    password: 'driver123',
    icon: Truck,
    color: 'amber',
    description: 'Browse jobs, place bids',
  },
  {
    id: 3,
    role: 'CLIENT',
    name: 'Client User',
    email: 'client@example.com',
    password: 'client123',
    icon: UserCircle,
    color: 'blue',
    description: 'Post shipments, track deliveries',
  }
];

export default function LoginPage() {
  const { login, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  // Check URL params for messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }

    if (urlParams.get('session') === 'expired') {
      setSessionExpired(true);
      setTimeout(() => setSessionExpired(false), 5000);
    }

    // Clean URL
    if (urlParams.toString()) {
      window.history.replaceState({}, '', '/auth/login');
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Middleware will handle redirect based on role
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillTestAccount = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
    setServerError('');
    setShowTestAccounts(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    setServerError('');
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // AuthContext handles the redirect via middleware
      // The middleware will read the cookie and redirect to the appropriate dashboard
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract error message from various possible formats
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'border-purple-200 bg-purple-50 hover:bg-purple-100';
      case 'amber':
        return 'border-amber-200 bg-amber-50 hover:bg-amber-100';
      case 'blue':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'purple':
        return 'text-purple-600';
      case 'amber':
        return 'text-amber-600';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const isLoadingState = isLoading || authLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardBody className="p-6 sm:p-8">
            {/* Logo */}
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Truck className="h-6 w-6 text-primary-600" />
              </div>
              <h1 className="mt-3 text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-green-700 text-center">
                  Registration successful! Please sign in.
                </p>
              </div>
            )}

            {/* Session Expired Message */}
            {sessionExpired && (
              <div className="mb-4 rounded-lg bg-yellow-50 p-3 border border-yellow-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-yellow-700 text-center">
                  Your session has expired. Please sign in again.
                </p>
              </div>
            )}

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 border border-red-200 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-200'} py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500`}
                    placeholder="you@example.com"
                    disabled={isLoadingState}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-200'} py-2 pl-9 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500`}
                    placeholder="••••••••"
                    disabled={isLoadingState}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    disabled={isLoadingState}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                    disabled={isLoadingState}
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                loading={isLoadingState}
                disabled={isLoadingState}
                className="flex items-center justify-center gap-2"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Test Accounts Toggle */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowTestAccounts(!showTestAccounts)}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg py-2"
                disabled={isLoadingState}
              >
                <Users className="h-4 w-4" />
                {showTestAccounts ? 'Hide' : 'Show'} Test Accounts
              </button>
            </div>

            {/* Test Accounts */}
            {showTestAccounts && (
              <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs text-gray-500 text-center mb-2">Quick login with test accounts:</p>
                {TEST_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => fillTestAccount(account.email, account.password)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${getColorClasses(account.color)} hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      disabled={isLoadingState}
                    >
                      <div className={`p-2 rounded-lg bg-white ${getIconColor(account.color)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">{account.name}</p>
                        <p className="text-xs text-gray-500">{account.description}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{account.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white ${getIconColor(account.color)}`}>
                          {account.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
                <p className="text-xs text-gray-400 text-center mt-3">
                  These are test accounts for development purposes.
                </p>
              </div>
            )}

            {/* Sign up link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                Sign up
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}