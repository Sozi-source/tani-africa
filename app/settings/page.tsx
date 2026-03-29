'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Lock, Bell, Moon, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      // API call to change password
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container-custom py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Settings</h1>

          {/* Change Password */}
          <Card className="mb-6">
            <CardBody>
              <div className="mb-4 flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
                <Button type="submit" variant="primary" loading={isLoading}>
                  Update Password
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Notifications */}
          <Card className="mb-6">
            <CardBody>
              <div className="mb-4 flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email Notifications</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600" defaultChecked />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Push Notifications</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">SMS Alerts</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Preferences */}
          <Card className="mb-6">
            <CardBody>
              <div className="mb-4 flex items-center space-x-2">
                <Moon className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Dark Mode</span>
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Language</span>
                  <select className="rounded-lg border border-gray-300 px-3 py-1">
                    <option>English</option>
                    <option>Swahili</option>
                  </select>
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardBody>
              <div className="mb-4 flex items-center space-x-2">
                <Globe className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="danger">Delete Account</Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}