import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      <PublicHeader />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md py-12">
          {children}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}