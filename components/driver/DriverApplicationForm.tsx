'use client';

import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
  Truck,
  Loader2,
  IdCard,
  Car,
  Calendar,
  FileText,
  CreditCard,
  Upload,
  CheckCircle,
} from 'lucide-react';

interface DriverApplicationFormProps {
  onSuccess?: () => void;
}

export function DriverApplicationForm({ onSuccess }: DriverApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    vehicleType: '',
    experienceYears: '',
    licenseDoc: '',
    insuranceDoc: '',
    registrationDoc: '',
  });

  const vehicleTypes = [
    { value: 'C1_LIGHT_TRUCK', label: 'Light Truck (≤ 7.5T)' },
    { value: 'C_MEDIUM_TRUCK', label: 'Medium Truck (> 7.5T)' },
    { value: 'CE_HEAVY_TRUCK_TRAILER', label: 'Heavy Truck + Trailer' },
    { value: 'CD_HEAVY_GOODS_VEHICLE', label: 'Heavy Goods Vehicle' },
    { value: 'B2_LIGHT_MANUAL_VEHICLE', label: 'Light Manual Vehicle' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/driver-applications', {
        licenseNumber: formData.licenseNumber,
        vehicleType: formData.vehicleType || undefined,
        experienceYears: formData.experienceYears
          ? Number(formData.experienceYears)
          : undefined,
        licenseDoc: formData.licenseDoc || undefined,
        insuranceDoc: formData.insuranceDoc || undefined,
        registrationDoc: formData.registrationDoc || undefined,
      });

      toast.success('Application submitted successfully');
      setFormData({
        licenseNumber: '',
        vehicleType: '',
        experienceYears: '',
        licenseDoc: '',
        insuranceDoc: '',
        registrationDoc: '',
      });

      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="maroon" className="border border-gray-200 shadow-md">
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-maroon-100 to-maroon-200 shadow-sm">
            <Truck className="h-8 w-8 text-maroon-600" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-maroon-700 to-teal-700 bg-clip-text text-transparent">
            Driver Application
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Apply to start accepting delivery jobs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* License */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              License Number <span className="text-maroon-500">*</span>
            </label>
            <input
              name="licenseNumber"
              required
              value={formData.licenseNumber}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-maroon-500 focus:ring-2 focus:ring-maroon-200 transition-colors"
              placeholder="DL-XXXXXX"
            />
          </div>

          {/* Vehicle */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Vehicle Type
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
            >
              <option value="">Select vehicle</option>
              {vehicleTypes.map(v => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              max="50"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
            />
          </div>

          {/* Documents */}
          {[
            { key: 'licenseDoc', label: 'License Document', icon: FileText, color: 'maroon' },
            { key: 'insuranceDoc', label: 'Insurance Document', icon: CreditCard, color: 'teal' },
            { key: 'registrationDoc', label: 'Vehicle Registration', icon: Upload, color: 'green' },
          ].map(({ key, label, icon: Icon, color }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <div className="relative mt-1">
                <input
                  type="url"
                  name={key}
                  value={(formData as any)[key]}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={`w-full rounded-lg border px-4 py-2.5 pl-10 focus:ring-2 transition-colors ${
                    (formData as any)[key] &&
                    isValidUrl((formData as any)[key])
                      ? `border-${color === 'maroon' ? 'maroon' : color === 'teal' ? 'teal' : 'green'}-400 focus:ring-${color === 'maroon' ? 'maroon' : color === 'teal' ? 'teal' : 'green'}-200`
                      : 'border-gray-300 focus:border-maroon-500 focus:ring-maroon-200'
                  }`}
                />
                <Icon className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-${color === 'maroon' ? 'maroon' : color === 'teal' ? 'teal' : 'green'}-400`} />
                {(formData as any)[key] &&
                  isValidUrl((formData as any)[key]) && (
                    <CheckCircle className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-${color === 'maroon' ? 'maroon' : color === 'teal' ? 'teal' : 'green'}-600`} />
                  )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-maroon-600 to-teal-600 py-3 text-white font-semibold hover:from-maroon-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-60 shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>
      </CardBody>
    </Card>
  );
}