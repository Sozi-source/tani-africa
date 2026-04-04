// app/(app)/dashboard/components/StatCard.tsx
'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'gray';
}

/* ================= COLOR MAP ================= */
const COLOR_MAP: Record<
  NonNullable<StatCardProps['color']>,
  { bg: string; text: string; lightBg: string }
> = {
  red: {
    bg: 'bg-gradient-to-br from-red-500 to-red-600',
    text: 'text-red-600',
    lightBg: 'bg-red-50',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    text: 'text-green-600',
    lightBg: 'bg-green-50',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    text: 'text-yellow-700',
    lightBg: 'bg-yellow-50',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    text: 'text-purple-600',
    lightBg: 'bg-purple-50',
  },
  gray: {
    bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
    text: 'text-gray-600',
    lightBg: 'bg-gray-100',
  },
};

/* ================= COMPONENT ================= */
export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'gray',
}: StatCardProps) {
  const styles = COLOR_MAP[color];

  return (
    <Card hover className="border border-gray-100 overflow-hidden group transition-all duration-300">
      <CardBody className="p-3 xs:p-4 sm:p-4 md:p-5">
        {/* Responsive Layout: Horizontal on mobile, Vertical on tablet+ */}
        <div className="flex flex-row items-center justify-between sm:flex-col sm:items-start gap-2 xs:gap-3 sm:gap-2">
          
          {/* Left Section - Icon and Title */}
          <div className="flex flex-row items-center gap-2 xs:gap-3 sm:flex-col sm:items-start sm:gap-1.5">
            {/* Icon with Gradient Background */}
            <div
              className={`rounded-xl p-2 xs:p-2.5 ${styles.lightBg} group-hover:scale-110 transition-transform duration-300`}
              aria-hidden
            >
              <Icon className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 ${styles.text}`} />
            </div>

            {/* Title - Hidden on extra small, visible on larger */}
            <span className="hidden xs:inline-block text-xs xs:text-sm sm:text-sm font-medium text-gray-500 sm:mt-1">
              {title}
            </span>
          </div>

          {/* Right Section - Value */}
          <div className="text-right sm:text-left">
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              {value}
            </p>
            {/* Mobile-only title (visible only on very small screens) */}
            <span className="xs:hidden text-[10px] font-medium text-gray-400 mt-0.5 block">
              {title}
            </span>
          </div>
        </div>

        {/* Subtle Progress Bar (Optional - adds visual interest) */}
        <div className="mt-2 xs:mt-3 sm:mt-3 md:mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${color === 'red' ? 'from-red-500 to-red-600' : 
              color === 'green' ? 'from-green-500 to-emerald-600' :
              color === 'yellow' ? 'from-yellow-500 to-amber-600' :
              color === 'blue' ? 'from-blue-500 to-blue-600' :
              color === 'purple' ? 'from-purple-500 to-purple-600' :
              'from-gray-500 to-gray-600'}`}
            style={{ width: '0%' }}
          />
        </div>
      </CardBody>
    </Card>
  );
}