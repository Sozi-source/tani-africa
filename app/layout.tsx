// app/layout.tsx
'use client';

import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ClientCleaner } from '@/components/providers/ClientCleaner';
import { LogoutLoader } from '@/components/ui/LogoutLoader';
import './globals.css';

/* ================= Fonts ================= */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/* ================= RootShell ================= */
/**
 * Consumes AuthContext safely and renders
 * the global logout overlay when required.
 */
function RootShell({ children }: { children: React.ReactNode }) {
  const { isLoggingOut, user } = useAuth();

  return (
    <>
      {/* ✅ Global Logout Overlay */}
      {isLoggingOut && (
        <LogoutLoader userName={user?.firstName} />
      )}

      {/* ✅ App content */}
      {children}
    </>
  );
}

/* ================= Root Layout ================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-gray-50 font-sans antialiased"
      >
        <AuthProvider>
          {/* ✅ Clears stale client data on mount */}
          <ClientCleaner />

          {/* ✅ Auth‑aware shell */}
          <RootShell>{children}</RootShell>

          {/* ✅ Global toaster */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'var(--font-inter)',
                borderRadius: '12px',
                padding: '12px 16px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}