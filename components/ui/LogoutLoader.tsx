// components/ui/LogoutLoader.tsx (simplified)
'use client';

import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LogoutLoader() {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => Math.max(0, prev - 2));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-maroon-600 to-maroon-800">
      <div className="flex flex-col items-center gap-6 select-none">
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
          <div className="relative bg-white/15 rounded-full p-6 backdrop-blur-sm">
            <LogOut className="h-12 w-12 text-white animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Goodbye!
          </h2>
          <p className="text-white/90 text-base sm:text-lg">
            You are being logged out securely...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 sm:w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-white rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-white/50 text-xs mt-4">
          Thank you for using Tani Africa
        </p>
      </div>
    </div>
  );
}