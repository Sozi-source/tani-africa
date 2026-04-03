'use client';

import { Card, CardBody } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: number;
}

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <Card hover className="h-full transition-all duration-300 hover:shadow-lg">
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5 truncate">{title}</p>
            <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <div className="hidden sm:flex items-center gap-1 mt-1">
                <TrendingUp className={`h-2.5 w-2.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-[10px] sm:text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className={`rounded-lg bg-gradient-to-r ${color} p-2 sm:p-2.5 flex-shrink-0`}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}