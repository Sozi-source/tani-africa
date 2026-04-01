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
  CheckCircle
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
    { value: 'C1_LIGHT_TRUCK', label: 'Light Truck (up to 7.5 tons)', icon: '🚚' },
    { value: 'C_MEDIUM_TRUCK', label: 'Medium Truck (over 7.5 tons)', icon: '🚛' },
    { value: 'CE_HEAVY_TRUCK_TRAILER', label: 'Heavy Truck with Trailer', icon: '🚛' },
    { value: 'CD_HEAVY_GOODS_VEHICLE', label: 'Heavy Goods Vehicle', icon: '🏭' },
    { value: 'B2_LIGHT_MANUAL_VEHICLE', label: 'Light Manual Vehicle', icon: '🚗' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const experienceYearsValue = formData.experienceYears ? parseInt(formData.experienceYears) : undefined;

      await apiClient.post('/driver-applications', {
        licenseNumber: formData.licenseNumber,
        vehicleType: formData.vehicleType || undefined,
        experienceYears: experienceYearsValue,
        licenseDoc: formData.licenseDoc || undefined,
        insuranceDoc: formData.insuranceDoc || undefined,
        registrationDoc: formData.registrationDoc || undefined,
      });

      toast.success('Application submitted successfully! Admin will review it shortly.');
      
      // Reset form
      setFormData({
        licenseNumber: '',
        vehicleType: '',
        experienceYears: '',
        licenseDoc: '',
        insuranceDoc: '',
        registrationDoc: '',
      });
      
      // Call onSuccess callback to refresh dashboard
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card className="shadow-xl border-0">
      <CardBody className="p-6 sm:p-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Driver Application</h2>
          <p className="text-gray-500 mt-2">
            Complete the form below to start your journey with us
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* License Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-gray-400" />
                Driver's License Number *
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="licenseNumber"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Enter your driver's license number"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
              />
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-400" />
                Vehicle Type
              </span>
            </label>
            <div className="relative">
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 appearance-none focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all bg-white"
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Experience Years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                Years of Experience
              </span>
            </label>
            <input
              type="number"
              name="experienceYears"
              min="0"
              max="50"
              value={formData.experienceYears}
              onChange={handleChange}
              placeholder="Number of years driving"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>

          {/* Documents Section */}
          <div className="pt-4">
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supporting Documents</h3>
              <p className="text-sm text-gray-500">
                Upload your documents to cloud storage and paste the shareable links below
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License Document
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="licenseDoc"
                    value={formData.licenseDoc}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className={`w-full rounded-xl border px-4 py-3 pl-11 focus:outline-none focus:ring-2 transition-all ${
                      formData.licenseDoc && isValidUrl(formData.licenseDoc)
                        ? 'border-green-300 focus:ring-green-200 bg-green-50'
                        : formData.licenseDoc
                        ? 'border-red-300 focus:ring-red-200 bg-red-50'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                  />
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {formData.licenseDoc && isValidUrl(formData.licenseDoc) && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Document
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="insuranceDoc"
                    value={formData.insuranceDoc}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Registration Document
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="registrationDoc"
                    value={formData.registrationDoc}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-11 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                  />
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 py-4 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Truck className="h-5 w-5" />
                Submit Application
              </>
            )}
          </button>
        </form>
      </CardBody>
    </Card>
  );
}