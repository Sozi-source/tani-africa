'use client';

import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ClientCleaner } from '@/components/providers/ClientCleaner';
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
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-gray-50 antialiased">

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