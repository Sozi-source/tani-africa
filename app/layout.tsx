'use client';

import { useState, useEffect } from 'react';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ClientCleaner } from '@/components/providers/ClientCleaner';
import { LogOut } from 'lucide-react';
import './globals.css';

/* ================= Fonts ================= */

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [progress, setProgress] = useState(100);

  // Listen for logout event
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggingOut(true);
      
      // Animate progress bar
      const interval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - 2));
      }, 30);
      
      // Clear storage and redirect after animation
      setTimeout(() => {
        clearInterval(interval);
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.split('=');
          if (name?.trim()) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
        
        window.location.href = '/auth/login';
      }, 1500);
    };

    window.addEventListener('app:logout', handleLogout);
    return () => window.removeEventListener('app:logout', handleLogout);
  }, []);

  // Show logout screen if logging out
  if (isLoggingOut) {
    return (
      <html
        lang="en"
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen antialiased">
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#8a1e31] to-[#55121e]">
            <div className="flex flex-col items-center gap-6 select-none px-8">
              {/* Animated Icon */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                <div className="relative bg-white/10 rounded-full p-6 backdrop-blur-sm">
                  <LogOut className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Goodbye!
                </h2>
                <p className="text-white/80 text-base sm:text-lg">
                  You are being logged out securely...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-64 sm:w-80 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Footer */}
              <p className="text-white/30 text-xs mt-4">
                Thank you for using Tani Africa
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        {/* ✅ Providers ONLY here */}
        <AuthProvider>
          <ClientCleaner />

          {children}

          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}