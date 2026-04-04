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
  iconBgColor: string; // kept for compatibility
  iconColor: string;  // kept for compatibility
}

export function QuickActionCard({
  href,
  icon,
  title,
  description,
  iconBgColor,
  iconColor,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block focus:outline-none">
      <Card
        hover
        className="
          border border-gray-200
          transition-shadow
          cursor-pointer
        "
      >
        <CardBody className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            
            {/* Icon + Text */}
            <div className="flex items-center gap-4 min-w-0">
              
              {/* Icon */}
              <div
                className={`
                  flex h-11 w-11 sm:h-12 sm:w-12
                  items-center justify-center
                  rounded-xl
                  ${iconBgColor}
                `}
              >
                <div className={`${iconColor}`}>
                  {icon}
                </div>
              </div>

              {/* Text */}
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {title}
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-gray-500 line-clamp-2">
                  {description}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}