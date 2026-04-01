import dynamic from 'next/dynamic';

// Dynamically import the client header with no SSR
const ClientHeader = dynamic(
  () => import('./ClientHeader').then(mod => mod.ClientHeader),
  { 
    ssr: false,
    loading: () => (
      <header className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-primary-500 lg:h-10 lg:w-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent lg:text-2xl">
                Tani Africa
              </span>
            </div>
            <div className="h-8 w-8" />
          </div>
        </div>
      </header>
    )
  }
);

import { Truck } from 'lucide-react';

export function Header() {
  return <ClientHeader />;
}