// components/ui/LogoutButton.tsx
'use client';

import { useLogout } from '@/lib/hooks/useLogout';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'sidebar' | 'header' | 'dropdown';
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function LogoutButton({ 
  variant = 'sidebar', 
  className = '', 
  showIcon = true, 
  showText = true 
}: LogoutButtonProps) {
  const { handleLogout, isLoggingOut } = useLogout();

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`
          group relative flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 
          transition-all duration-200 font-medium
          ${isLoggingOut 
            ? 'bg-gray-100 text-gray-400 cursor-wait opacity-70' 
            : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-sm border border-gray-200'
          }
          ${className}
        `}
      >
        {isLoggingOut ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            {showText && <span className="text-sm">Logging out...</span>}
          </>
        ) : (
          <>
            {showIcon && <LogOut className="h-5 w-5 transition-all duration-200 group-hover:scale-110 group-hover:text-red-600" />}
            {showText && <span className="text-sm font-medium">Logout</span>}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
    >
      {isLoggingOut ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </>
      )}
    </button>
  );
}