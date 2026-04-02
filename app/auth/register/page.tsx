// app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Truck, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

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
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (formData.phone && !/^\+?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) newErrors.phone = 'Valid phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError('');
    
    try {
      const { confirmPassword, ...registerData } = formData;
      
      await apiClient.post('/users', registerData);
      
      // Redirect to login page with success message
      router.push('/auth/login?registered=true');
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardBody className="p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
              <p className="mt-2 text-sm text-gray-500">Join Tani Africa today</p>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600 text-center">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  icon={<User className="h-4 w-4 text-gray-400" />}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  icon={<User className="h-4 w-4 text-gray-400" />}
                />
              </div>

              {/* Email */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="h-4 w-4 text-gray-400" />}
              />

              {/* Phone */}
              <Input
                label="Phone Number (Optional)"
                name="phone"
                type="tel"
                placeholder="+254 700 123 456"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={<Phone className="h-4 w-4 text-gray-400" />}
              />

              {/* Password */}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                loading={isLoading}
                className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-amber-600 hover:text-amber-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Terms */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-amber-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-amber-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}