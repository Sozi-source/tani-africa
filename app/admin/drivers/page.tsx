'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export const dynamic = 'force-dynamic';

type Driver = {
  id: string;
  name: string;
  phone?: string;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/drivers`
        );

        setDrivers(res.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch drivers', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDrivers();
  }, []);

  if (loading) return <p>Loading drivers...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Drivers</h1>

      <div className="space-y-4">
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="p-4 bg-white rounded shadow"
          >
            <p className="font-semibold">{driver.name}</p>
            <p className="text-sm text-gray-500">
              {driver.phone}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}