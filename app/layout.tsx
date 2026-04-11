'use client';

import { useState, useEffect } from 'react';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ClientCleaner } from '@/components/providers/ClientCleaner';
import { LogOut, ShoppingBag, Truck } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

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
        <body 
          className="min-h-screen antialiased"
          suppressHydrationWarning
        >
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-maroon">
            {/* Animated Background Pattern */}
            <div 
              className="absolute inset-0 overflow-hidden"
              suppressHydrationWarning
            >
              <div 
                className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"
                suppressHydrationWarning
              />
              <div 
                className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"
                suppressHydrationWarning
              />
            </div>

            <div className="flex flex-col items-center gap-6 select-none px-8 relative z-10">
              {/* Animated Icon Container */}
              <div 
                className="relative"
                suppressHydrationWarning
              >
                <div 
                  className="absolute inset-0 rounded-full bg-yellow-500/30 animate-ping"
                  suppressHydrationWarning
                />
                <div className="relative bg-white/10 rounded-full p-6 backdrop-blur-sm border border-white/20">
                  <ShoppingBag className="h-12 w-12 text-yellow-400 animate-bounce-slow" />
                </div>
              </div>

              {/* Message */}
              <div 
                className="text-center space-y-2"
                suppressHydrationWarning
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading">
                  See You Soon!
                </h2>
                <p className="text-white/80 text-base sm:text-lg">
                  You are being securely logged out of Tani Africa
                </p>
              </div>

              {/* Progress Bar - Naivas Gold */}
              <div 
                className="w-64 sm:w-80 h-1.5 bg-white/20 rounded-full overflow-hidden"
                suppressHydrationWarning
              >
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                  suppressHydrationWarning
                />
              </div>

              {/* Footer */}
              <div 
                className="flex items-center gap-2 text-white/30 text-xs mt-4"
                suppressHydrationWarning
              >
                <Truck className="h-3 w-3" />
                <span>Tani Africa Logistics Platform</span>
              </div>
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
      <body 
        className="min-h-screen antialiased bg-gray-50"
        suppressHydrationWarning
      >
        {/* ✅ Providers ONLY here */}
        <AuthProvider>
          <ClientCleaner />

          {/* Main Content - Only render after mounted to prevent hydration mismatch */}
          <main 
            className="relative"
            suppressHydrationWarning
          >
            {mounted ? children : null}
          </main>

          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #fce8e8',
                borderRadius: '0.75rem',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}