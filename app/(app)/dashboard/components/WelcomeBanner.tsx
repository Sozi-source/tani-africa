'use client';

import { Sparkles, Truck, User, ShieldCheck } from 'lucide-react';

interface WelcomeBannerProps {
  firstName?: string;
  role: string;
  subtitle: string;
  gradient: string;
}

export function WelcomeBanner({ firstName, role, subtitle, gradient }: WelcomeBannerProps) {
  const roleIcons: Record<string, React.ReactNode> = {
    ADMIN: <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
    DRIVER: <Truck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
    CLIENT: <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
  };

  return (
    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r ${gradient} p-4 sm:p-5 md:p-6 text-white shadow-lg`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-300/20 rounded-full blur-2xl" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 relative z-10">
        <div className="flex-1">
          <p className="text-white/80 text-[11px] sm:text-xs flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 bg-green-300 rounded-full animate-pulse" />
            Welcome back,
          </p>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mt-0.5">
            {firstName || 'User'}!
          </h1>
          <p className="text-white/80 text-[11px] sm:text-xs mt-1 flex items-center gap-1 flex-wrap">
            <Sparkles className="h-2.5 w-2.5" />
            {subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 rounded-full bg-white/20 backdrop-blur-sm text-[11px] sm:text-xs font-semibold shadow-lg">
            {roleIcons[role] || roleIcons.CLIENT}
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}