// app/auth/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Truck, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import apiClient from '@/lib/api/client';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    role: string;
    [key: string]: any;
  };
};

export default function LoginPage() {
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }

    if (urlParams.get('session') === 'expired') {
      setSessionExpired(true);
    }

    if (urlParams.toString()) {
      window.history.replaceState({}, '', '/auth/login');
    }
  }, []);

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
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setIsLoading(true);
  setServerError('');

  try {
    const data = await apiClient.post('/auth/login', {
      email: formData.email,
      password: formData.password,
    }) as { accessToken: string; refreshToken: string; user: any };

    const { accessToken, refreshToken, user } = data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'ADMIN') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  } catch (error: any) {
    console.error('Login error:', error);
    setServerError(error.message || 'Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};

  const setTestCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
    setServerError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardBody className="p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mt-2 text-gray-600">Sign in to your account</p>
            </div>

            {/* Session Expired Message */}
            {sessionExpired && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-700 text-center">
                  Your session has expired. Please sign in again.
                </p>
              </div>
            )}

            {/* Registration Success Message */}
            {showSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-600 text-center">
                  Registration successful! Please login with your credentials.
                </p>
              </div>
            )}

            {/* Test Accounts */}
            <div className="mb-6 space-y-2">
              <p className="text-center text-sm text-gray-500">Quick Test Accounts:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setTestCredentials('client@example.com', 'client123')}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setTestCredentials('driver@example.com', 'driver123')}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Driver
                </button>
                <button
                  type="button"
                  onClick={() => setTestCredentials('admin@example.com', 'admin123')}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600 text-center">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="h-4 w-4 text-gray-400" />}
                autoComplete="email"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-amber-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/register" className="font-medium text-amber-600 hover:text-amber-700 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}