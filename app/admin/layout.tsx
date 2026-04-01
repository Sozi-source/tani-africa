import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-3">
          <a href="/admin" className="block hover:text-gray-300">
            Dashboard
          </a>

          <a href="/admin/drivers" className="block hover:text-gray-300">
            Drivers
          </a>

          <a href="/admin/users" className="block hover:text-gray-300">
            Users
          </a>

          <a href="/admin/jobs" className="block hover:text-gray-300">
            Jobs
          </a>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}