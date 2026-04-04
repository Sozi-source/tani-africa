// app/layout.tsx
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ClientCleaner } from '@/components/providers/ClientCleaner';
import './globals.css';

/* ---------------- Fonts ---------------- */

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

/* ---------------- Layout ---------------- */

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
    >
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <AuthProvider>
          <ClientCleaner />

          {children}

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