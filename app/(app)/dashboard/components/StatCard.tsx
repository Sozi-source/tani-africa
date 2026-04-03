// app/(app)/dashboard/components/StatCard.tsx - Compact Version
'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-0">
      <CardBody className="p-2.5 xs:p-3 sm:p-4">
        {/* Horizontal layout on mobile, vertical on larger */}
        <div className="flex flex-row items-center justify-between sm:flex-col sm:items-start gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-0 sm:flex-col sm:items-start">
            <div className={`p-1.5 xs:p-2 rounded-xl bg-gradient-to-r ${color} bg-opacity-10`}>
              <Icon className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400 font-medium sm:mt-1.5">
              {title}
            </span>
          </div>
          <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}