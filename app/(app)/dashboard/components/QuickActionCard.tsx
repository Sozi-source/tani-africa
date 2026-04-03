'use client';

import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { ChevronRight } from 'lucide-react';

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function QuickActionCard({ 
  href, 
  icon, 
  title, 
  description, 
  iconBgColor = 'bg-gray-100',
  iconColor = 'text-gray-600'
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card hover className="cursor-pointer transition-all hover:shadow-md">
        <CardBody className="p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`rounded-lg ${iconBgColor} p-1.5 sm:p-2`}>
              <div className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${iconColor}`}>
                {icon}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-xs sm:text-sm">{title}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden xs:block">{description}</p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </CardBody>
      </Card>
    </Link>
  );
}