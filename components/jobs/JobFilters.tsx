'use client';

import { Input } from '@/components/ui/Input';
import { JOB_STATUS } from '@/lib/utils/constants';

interface JobFiltersProps {
  filters: {
    status: string;
    minPrice: string;
    maxPrice: string;
    location: string;
  };
  setFilters: (filters: any) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  setFilters,
}) => {
  const update = (key: string, value: string) =>
    setFilters({ ...filters, [key]: value });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select
          value={filters.status}
          onChange={e => update('status', e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        >
          <option value="">All</option>
          {Object.values(JOB_STATUS).map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Min Price (KES)"
        type="number"
        value={filters.minPrice}
        onChange={e => update('minPrice', e.target.value)}
      />

      <Input
        label="Max Price (KES)"
        type="number"
        value={filters.maxPrice}
        onChange={e => update('maxPrice', e.target.value)}
      />

      <Input
        label="Location"
        type="text"
        value={filters.location}
        onChange={e => update('location', e.target.value)}
      />
    </div>
  );
};