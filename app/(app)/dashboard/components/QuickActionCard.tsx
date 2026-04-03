// app/(app)/dashboard/components/QuickActionCard.tsx
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
}

export function QuickActionCard({ href, icon, title, description, iconBgColor, iconColor }: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0">
        <CardBody className="p-5 sm:p-6 md:p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
              <div className={`p-3 sm:p-4 rounded-xl ${iconBgColor} group-hover:scale-105 transition-transform duration-300`}>
                <div className={`${iconColor}`}>{icon}</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl">{title}</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-1.5">{description}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-2 transition-all duration-300" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}