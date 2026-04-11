// components/StatCard.tsx
'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'maroon' | 'gold' | 'green' | 'teal' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  isLoading?: boolean;
}

const COLOR_MAP = {
  maroon: {
    iconBg: 'bg-maroon-100',
    iconColor: 'text-maroon-600',
    badgeUp: 'bg-green-100 text-green-700',
    badgeDown: 'bg-red-100 text-red-700',
    progress: 'bg-maroon-500',
  },
  gold: {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    badgeUp: 'bg-green-100 text-green-700',
    badgeDown: 'bg-red-100 text-red-700',
    progress: 'bg-yellow-500',
  },
  green: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    badgeUp: 'bg-green-100 text-green-700',
    badgeDown: 'bg-red-100 text-red-700',
    progress: 'bg-green-500',
  },
  teal: {
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    badgeUp: 'bg-green-100 text-green-700',
    badgeDown: 'bg-red-100 text-red-700',
    progress: 'bg-teal-500',
  },
  gray: {
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    badgeUp: 'bg-green-100 text-green-700',
    badgeDown: 'bg-red-100 text-red-700',
    progress: 'bg-gray-500',
  },
};

// ✅ Export StatCard component
export function StatCard({ title, value, icon: Icon, color = 'maroon', trend, isLoading = false }: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg p-1.5 bg-gray-200">
              <div className="h-4 w-4" />
            </div>
            <div>
              <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formattedValue = typeof value === 'number'
    ? value >= 1000000
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : value.toLocaleString()
    : value;

  const styles = COLOR_MAP[color];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-1.5 ${styles.iconBg} transition-transform duration-300 group-hover:scale-105`}>
            <Icon className={`h-4 w-4 ${styles.iconColor}`} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {title}
            </p>
            <p className="text-xl font-bold leading-tight text-gray-900">
              {formattedValue}
            </p>
            {trend?.label && (
              <p className="text-[10px] text-gray-400 mt-0.5">{trend.label}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            trend.isPositive ? styles.badgeUp : styles.badgeDown
          }`}>
            <span className="inline-flex items-center gap-0.5">
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 h-0.5 rounded-full bg-gray-100 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
          style={{ width: trend ? `${Math.min(Math.abs(trend.value), 100)}%` : '0%' }}
        />
      </div>
    </div>
  );
}

// ✅ Export StatsGrid from the SAME file
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}