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
    <Card className="border border-gray-200">
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100">
            <Truck className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
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
              License Number *
            </label>
            <input
              name="licenseNumber"
              required
              value={formData.licenseNumber}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200"
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200"
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
          </div>

          {/* Documents */}
          {[
            { key: 'licenseDoc', label: 'License Document', icon: FileText },
            { key: 'insuranceDoc', label: 'Insurance Document', icon: CreditCard },
            {
              key: 'registrationDoc',
              label: 'Vehicle Registration',
              icon: Upload,
            },
          ].map(({ key, label, icon: Icon }) => (
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
                  className={`w-full rounded-lg border px-4 py-2 pl-10 focus:ring-2 ${
                    (formData as any)[key] &&
                    isValidUrl((formData as any)[key])
                      ? 'border-green-400 focus:ring-green-200'
                      : 'border-gray-300 focus:ring-red-200'
                  }`}
                />
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                {(formData as any)[key] &&
                  isValidUrl((formData as any)[key]) && (
                    <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
                  )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-white hover:bg-red-700 disabled:opacity-60"
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