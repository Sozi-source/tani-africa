'use client';

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { usersAPI } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  User,
  Mail,
  Phone,
  Truck,
  Star,
  Calendar,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  Clock,
  TrendingUp,
  Briefcase,
  Settings,
  LogOut,
  Package,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { User as UserType } from '@/types';

/* ================= TYPES ================= */

interface ExtendedUser extends UserType {
  bio?: string;
  location?: string;
  status?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  bio: string;
  location: string;
}

type Tab = 'profile' | 'activity' | 'settings';

/* ================= ROLE CONFIG ================= */

const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
  }
> = {
  ADMIN: {
    label: 'Administrator',
    Icon: Shield,
    badgeClass: 'bg-red-100 text-red-700',
  },
  DRIVER: {
    label: 'Driver',
    Icon: Truck,
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  CLIENT: {
    label: 'Client',
    Icon: Briefcase,
    badgeClass: 'bg-green-100 text-green-700',
  },
};

/* ================= COMPONENT ================= */

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const extendedUser = user as ExtendedUser | null;

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    bio: '',
    location: '',
  });

  /* ---------- INIT ---------- */

  useEffect(() => {
    if (!extendedUser) return;
    setFormData({
      firstName: extendedUser.firstName ?? '',
      lastName: extendedUser.lastName ?? '',
      phone: extendedUser.phone ?? '',
      email: extendedUser.email ?? '',
      bio: extendedUser.bio ?? '',
      location: extendedUser.location ?? '',
    });
  }, [extendedUser]);

  /* ---------- HANDLERS ---------- */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    toast.success('Profile photo selected');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!extendedUser?.id) return;

    setIsSaving(true);
    try {
      await usersAPI.update(extendedUser.id, formData);
      toast.success('Profile updated');
      setIsEditing(false);
      window.location.reload();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- DERIVED ---------- */

  const role = extendedUser?.role ?? 'CLIENT';
  const roleConfig = ROLE_CONFIG[role];
  const RoleIcon = roleConfig.Icon;

  const initials =
    `${extendedUser?.firstName?.[0] ?? ''}${extendedUser?.lastName?.[0] ?? ''}`.toUpperCase();

  const stats = [
    {
      label: 'Rating',
      value: extendedUser?.rating ? `${extendedUser.rating}/5` : '—',
      Icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Trips',
      value: extendedUser?.totalTrips ?? '—',
      Icon: Truck,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Member Since',
      value: extendedUser?.createdAt
        ? new Date(extendedUser.createdAt).getFullYear()
        : '—',
      Icon: Calendar,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    },
    {
      label: 'Status',
      value: extendedUser?.status ?? 'Active',
      Icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  /* ================= RENDER ================= */

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4 space-y-6">

          {/* ===== HEADER ===== */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col sm:flex-row gap-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-20 w-20 rounded-xl bg-red-100 flex items-center justify-center cursor-pointer overflow-hidden"
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-red-600">
                  {initials || <User className="h-6 w-6" />}
                </span>
              )}

              <Camera className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-red-600 p-0.5 text-white" />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">
                {extendedUser?.firstName} {extendedUser?.lastName}
              </h1>

              <span
                className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig.badgeClass}`}
              >
                <RoleIcon className="h-3 w-3" />
                {roleConfig.label}
              </span>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                {extendedUser?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {extendedUser.email}
                  </span>
                )}
                {formData.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {formData.location}
                  </span>
                )}
              </div>
            </div>

            {!isEditing && activeTab === 'profile' && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* ===== STATS ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(s => (
              <div
                key={s.label}
                className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3"
              >
                <div className={`${s.bg} rounded-lg p-2`}>
                  <s.Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="font-semibold text-gray-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ===== TABS ===== */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex border-b border-gray-200">
              {(['profile', 'activity', 'settings'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsEditing(false);
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === tab
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                      <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                    </div>
                    <Input label="Email" name="email" value={formData.email} disabled />
                    <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                    <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
                    <textarea
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-200"
                    />
                    <div className="flex gap-3">
                      <Button type="submit" loading={isSaving}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-gray-600">
                    Click “Edit Profile” to update your information.
                  </p>
                )}
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="p-6 text-center">
                <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-600">No recent activity yet.</p>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="p-6 space-y-3">
                <Link
                  href="/auth/reset-password"
                  className="flex justify-between items-center rounded-lg bg-gray-50 px-4 py-3 hover:bg-gray-100"
                    >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                  
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}