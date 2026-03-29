'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usersAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { User, Mail, Phone, Truck, Star, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await usersAPI.update(user!.id, formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refresh user data
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Rating', value: user?.rating || 0, icon: Star, suffix: '/5' },
    { label: 'Total Trips', value: user?.totalTrips || 0, icon: Truck },
    { label: 'Member Since', value: new Date(user?.createdAt || '').getFullYear(), icon: Award },
  ];

  return (
    <ProtectedRoute>
      <div className="container-custom py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-3xl font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="mt-2 text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}{stat.suffix || ''}
                    </p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary-500" />
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Profile Form */}
          <Card>
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      icon={<User className="h-4 w-4" />}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                    icon={<Mail className="h-4 w-4" />}
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={<Phone className="h-4 w-4" />}
                  />

                  <div className="flex gap-3">
                    <Button type="submit" variant="primary" loading={isLoading}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="text-gray-900">{user?.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="text-gray-900">{user?.lastName}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}