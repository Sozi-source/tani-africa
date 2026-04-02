// app/profile/page.tsx
'use client';

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
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
import Link from 'next/link';
import { User as UserType } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtendedUser extends UserType {
  bio?: string;
  location?: string;
  status?: string;
}

interface FormData {
  firstName: string;
  lastName:  string;
  phone:     string;
  email:     string;
  bio:       string;
  location:  string;
}

type Tab = 'profile' | 'activity' | 'settings';

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  string,
  { label: string; accent: string; bg: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  ADMIN:  { label: 'Administrator',       accent: '#a855f7', bg: 'bg-purple-50',  Icon: Shield    },
  DRIVER: { label: 'Professional Driver', accent: '#f59e0b', bg: 'bg-amber-50',   Icon: Truck     },
  CLIENT: { label: 'Premium Client',      accent: '#3b82f6', bg: 'bg-blue-50',    Icon: Briefcase },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const extendedUser = user as ExtendedUser | null;

  const [isEditing,     setIsEditing]     = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [activeTab,     setActiveTab]     = useState<Tab>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName:  '',
    phone:     '',
    email:     '',
    bio:       '',
    location:  '',
  });

  useEffect(() => {
    if (extendedUser) {
      setFormData({
        firstName: extendedUser.firstName || '',
        lastName:  extendedUser.lastName  || '',
        phone:     extendedUser.phone     || '',
        email:     extendedUser.email     || '',
        bio:       extendedUser.bio       || '',
        location:  extendedUser.location  || '',
      });
    }
  }, [extendedUser]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    toast.success('Photo selected');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!extendedUser?.id) return;
    setIsSaving(true);
    try {
      await usersAPI.update(extendedUser.id, formData);
      localStorage.setItem('user', JSON.stringify({ ...extendedUser, ...formData }));
      toast.success('Profile updated');
      setIsEditing(false);
      window.location.reload();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const role       = extendedUser?.role || 'CLIENT';
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.CLIENT;
  const RoleIcon   = roleConfig.Icon;
  const initials   = `${extendedUser?.firstName?.[0] ?? ''}${extendedUser?.lastName?.[0] ?? ''}`.toUpperCase();

  const stats = [
    { label: 'Rating',      value: extendedUser?.rating     != null ? `${extendedUser.rating}/5` : '—', Icon: Star,        color: 'text-amber-500',  bg: 'bg-amber-50'  },
    { label: 'Total Trips', value: extendedUser?.totalTrips != null ? extendedUser.totalTrips     : '—', Icon: Truck,       color: 'text-blue-500',   bg: 'bg-blue-50'   },
    { label: 'Member Since',value: extendedUser?.createdAt  ? new Date(extendedUser.createdAt).getFullYear() : '—',          Icon: Calendar,    color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Status',      value: extendedUser?.status     ?? '—',                                       Icon: TrendingUp,  color: 'text-green-500',  bg: 'bg-green-50'  },
  ];

  const tabs: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'profile',  label: 'Profile',  Icon: User     },
    { id: 'activity', label: 'Activity', Icon: Clock    },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f5f0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');`}</style>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-5">

          {/* ── Header card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

            {/* Cover banner — clean amber/stone gradient, subtle dot grid */}
            <div
              className="h-24 sm:h-28 w-full relative overflow-hidden"
              style={{
              background: 'linear-gradient(120deg, #8659bb 0%, #2b62ac 40%, #5d98f0 100%)',
              }}
            >
              {/* Subtle dot texture */}
              <svg
                className="absolute inset-0 w-full h-full opacity-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>

            {/* Below-banner row: avatar + info + action */}
            <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-4">

              {/* Avatar — sits cleanly below the banner, no overlap */}
              <div
                className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-100 border-2 border-white shadow-md overflow-hidden cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-300">
                    <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-blue-600">
                      {initials || <User className="h-7 w-7 text-blue-400" />}
                    </span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-xl sm:text-2xl text-blue-900 leading-tight"
                  >
                    {extendedUser?.firstName} {extendedUser?.lastName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleConfig.bg}`}
                    style={{ color: roleConfig.accent }}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {roleConfig.label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                  {extendedUser?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {extendedUser.email}
                    </span>
                  )}
                  {formData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {formData.location}
                    </span>
                  )}
                </div>
                {formData.bio && (
                  <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 max-w-lg">{formData.bio}</p>
                )}
              </div>

              {/* Edit button */}
              {!isEditing && activeTab === 'profile' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium transition-colors self-start sm:self-center"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* ── Stats row ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                <div className={`${s.bg} rounded-xl p-2.5 flex-shrink-0`}>
                  <s.Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-400 truncate">{s.label}</p>
                  <p className="text-base sm:text-lg font-semibold text-stone-900 capitalize truncate">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabbed card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Tab bar */}
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {tabs.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTab(t.id); setIsEditing(false); }}
                    className={`flex items-center gap-2 px-5 sm:px-7 py-4 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                      active ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <t.Icon className="h-4 w-4" />
                    {t.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="p-6 sm:p-8">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required icon={<User className="h-4 w-4" />} />
                      <Input label="Last Name"  name="lastName"  value={formData.lastName}  onChange={handleChange} required icon={<User className="h-4 w-4" />} />
                    </div>
                    <Input label="Email Address" name="email"    type="email" value={formData.email}    onChange={handleChange} required disabled icon={<Mail  className="h-4 w-4" />} />
                    <Input label="Phone Number"  name="phone"    type="tel"   value={formData.phone}    onChange={handleChange} icon={<Phone className="h-4 w-4" />} />
                    <Input label="Location"      name="location"              value={formData.location} onChange={handleChange} icon={<MapPin className="h-4 w-4" />} placeholder="e.g. Nairobi, Kenya" />
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Bio</label>
                      <textarea
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself…"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button type="submit" variant="primary" loading={isSaving} className="gap-2 bg-stone-900 hover:bg-stone-800 border-stone-900">
                        <Save className="h-4 w-4" /> Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="max-w-2xl space-y-3">
                    {[
                      { label: 'First Name',    value: extendedUser?.firstName, Icon: User     },
                      { label: 'Last Name',     value: extendedUser?.lastName,  Icon: User     },
                      { label: 'Email Address', value: extendedUser?.email,     Icon: Mail     },
                      { label: 'Phone Number',  value: extendedUser?.phone,     Icon: Phone    },
                      { label: 'Location',      value: formData.location,       Icon: MapPin   },
                      { label: 'Bio',           value: formData.bio,            Icon: Briefcase },
                      { label: 'Account ID',    value: extendedUser?.id,        Icon: Shield   },
                      {
                        label: 'Member Since',
                        value: extendedUser?.createdAt
                          ? new Date(extendedUser.createdAt).toLocaleDateString('en-KE', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })
                          : undefined,
                        Icon: Calendar,
                      },
                    ]
                      .filter((row) => row.value)
                      .map((row) => (
                        <div key={row.label} className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 hover:bg-stone-100/70 transition-colors">
                          <div className="bg-white rounded-xl p-2 shadow-sm mt-0.5 flex-shrink-0">
                            <row.Icon className="h-4 w-4 text-stone-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-stone-400 mb-0.5">{row.label}</p>
                            <p className="text-sm font-medium text-stone-800 break-all">{row.value}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity tab */}
            {activeTab === 'activity' && (
              <div className="p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-stone-100 rounded-2xl p-5 mb-4">
                    <Package className="h-8 w-8 text-stone-400" />
                  </div>
                  <p className="font-medium text-stone-700 mb-1">No recent activity</p>
                  <p className="text-sm text-stone-400 mb-6 max-w-xs">
                    Jobs and deliveries linked to your account will appear here.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
                  >
                    Go to Dashboard <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <div className="p-6 sm:p-8 max-w-2xl space-y-3">
                {[
                  { title: 'Change Password',       desc: 'Update your account password',               href: '/auth/reset-password',      danger: false },
                  { title: 'Email Notifications',   desc: 'Configure what emails you receive',          href: '/settings/notifications',   danger: false },
                  { title: 'Delete Account',         desc: 'Permanently remove your account and data',  href: '/settings/delete',          danger: true  },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${
                      item.danger ? 'bg-red-50 hover:bg-red-100' : 'bg-stone-50 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${item.danger ? 'text-red-700' : 'text-stone-800'}`}>{item.title}</p>
                      <p className={`text-xs mt-0.5 ${item.danger ? 'text-red-400' : 'text-stone-400'}`}>{item.desc}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 ${item.danger ? 'text-red-400' : 'text-stone-300'}`} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sign out */}
          <div className="text-center pb-4">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}