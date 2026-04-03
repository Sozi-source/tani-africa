// app/(app)/dashboard/components/WelcomeBanner.tsx
'use client';

import { Sparkles, Truck, User, ShieldCheck } from 'lucide-react';

interface WelcomeBannerProps {
  firstName?: string;
  role: 'ADMIN' | 'DRIVER' | 'CLIENT';
  subtitle: string;
  gradient: string;
}

const roleIcons: Record<'ADMIN' | 'DRIVER' | 'CLIENT', React.ReactNode> = {
  ADMIN: <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />,
  DRIVER: <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />,
  CLIENT: <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
};

export function WelcomeBanner({ firstName, role, subtitle, gradient }: WelcomeBannerProps) {
  const displayName = firstName?.trim() || 'User';
  const greetingTime = new Date().getHours() < 12 ? 'morning' : 
                       new Date().getHours() < 18 ? 'afternoon' : 'evening';

  return (
    <div 
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r ${gradient} p-4 sm:p-5 md:p-6 lg:p-7 shadow-2xl transition-all duration-300`}
      role="banner"
      aria-label="Welcome banner"
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none">
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse" />
      </div>

      {/* Outer glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/30 via-transparent to-white/30 rounded-xl sm:rounded-2xl blur-xl opacity-50 pointer-events-none" />

      {/* Crystal clear overlay for sharpness */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl sm:rounded-2xl" />
      
      {/* Decorative background pattern - sharper */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 1px)', 
            backgroundSize: 'clamp(35px, 9vw, 50px) clamp(35px, 9vw, 50px)',
            backgroundPosition: '0 0'
          }} 
        />
      </div>
      
      {/* Animated glow orbs - subtle */}
      <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 bg-white/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-yellow-300/15 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />
      
      {/* Crystal clear highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 md:gap-6 relative z-10">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-white/90">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-[11px] xs:text-xs sm:text-sm font-medium tracking-wide drop-shadow-sm">
              Good {greetingTime},
            </span>
          </div>
          
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-1.5 break-words drop-shadow-md">
            {displayName}!
          </h1>
          
          <p className="text-white/90 text-[11px] xs:text-xs sm:text-sm mt-1 sm:mt-1.5 flex items-center gap-1.5 flex-wrap drop-shadow-sm">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="break-words">{subtitle}</span>
          </p>
        </div>
        
        {/* Role badge - with crystal clear glass effect */}
        <div className="flex-shrink-0 self-start sm:self-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/25 backdrop-blur-md text-[11px] xs:text-xs sm:text-sm font-semibold shadow-xl border border-white/30 transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-2xl">
            {roleIcons[role]}
            <span className="uppercase tracking-wide drop-shadow-sm">{role}</span>
          </div>
        </div>
      </div>

      {/* Bottom crystal highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
    </div>
  );
}