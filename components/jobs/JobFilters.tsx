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

export const JobFilters: React.FC<JobFiltersProps> = ({ filters, setFilters }) => {
  const handleChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          {Object.entries(JOB_STATUS).map(([key, value]) => (
            <option key={key} value={value}>{value}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Min Price (KES)</label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minPrice}
          onChange={(e) => handleChange('minPrice', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Max Price (KES)</label>
        <Input
          type="number"
          placeholder="Any"
          value={filters.maxPrice}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
        <Input
          type="text"
          placeholder="Search by location"
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>
    </div>
  );
};