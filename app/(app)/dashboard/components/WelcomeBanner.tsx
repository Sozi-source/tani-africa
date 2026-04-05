'use client';

import { Truck, User, ShieldCheck } from 'lucide-react';

interface WelcomeBannerProps {
  firstName?: string;
  role: 'ADMIN' | 'DRIVER' | 'CLIENT';
  subtitle: string;
  actions?: React.ReactNode;
}

/* ================= ROLE STYLES ================= */

const ROLE_STYLES: Record<
  WelcomeBannerProps['role'],
  {
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
  }
> = {
  ADMIN: {
    label: 'Administrator',
    Icon: ShieldCheck,
    badgeClass: 'bg-red-100 text-red-700',
  },
  DRIVER: {
    label: 'Driver',
    Icon: Truck,
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  CLIENT: {
    label: 'Client',
    Icon: User,
    badgeClass: 'bg-green-100 text-green-700',
  },
};

/* ================= COMPONENT ================= */

export function WelcomeBanner({
  firstName,
  role,
  subtitle,
}: WelcomeBannerProps) {
  const name = firstName?.trim() || 'User';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const roleConfig = ROLE_STYLES[role];
  const RoleIcon = roleConfig.Icon;

  return (
    <section
      aria-label="Welcome banner"
      className="
        rounded-2xl border border-gray-200
        bg-white
        p-5 sm:p-6 md:p-7
      "
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Text */}
        <div className="min-w-0">
          <p className="text-sm text-gray-500">
            {greeting},
          </p>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 truncate">
            {name}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Role Badge */}
        <div className="flex-shrink-0">
          <span
            className={`
              inline-flex items-center gap-2
              px-3 py-1.5
              rounded-full
              text-xs sm:text-sm font-medium
              ${roleConfig.badgeClass}
            `}
          >
            <RoleIcon className="h-4 w-4" />
            {roleConfig.label}
          </span>
        </div>
      </div>
    </section>
  );
}