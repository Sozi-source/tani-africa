'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: { fontFamily: 'var(--font-inter)' } 
        }} 
      />
    </AuthProvider>
  );
}