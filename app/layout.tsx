// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Tani Africa - Smart Logistics Platform', template: '%s | Tani Africa' },
  description: 'Connect with verified drivers, get competitive bids, and track your shipment in real-time across Kenya.',
  keywords: ['logistics', 'delivery', 'Kenya', 'cargo', 'transport'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'var(--font-inter)' } }} />
        </AuthProvider>
      </body>
    </html>
  );
}