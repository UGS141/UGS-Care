'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

const pharmacySchema = z.object({
  pharmacyName: z.string().min(2, 'Pharmacy name is required'),
  licenseNumber: z.string().min(3, 'License number is required'),
  licenseExpiryDate: z.string().min(1, 'License expiry date is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  pharmacyPhone: z.string().min(10, 'Pharmacy phone number is required'),
  operatingHours: z.string().min(1, 'Operating hours are required'),
  deliveryAvailable: z.boolean().optional(),
  insuranceAccepted: z.array(z.string()).optional(),
});

type PharmacyFormData = z.infer<typeof pharmacySchema>;

export default function PharmacyDetailsPage() {
  const router = useRouter();
  const auth = useAuth();
const updateOnboardingStep = auth?.updateOnboardingStep as ((step: string) => Promise<void>) | undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacySchema),
    defaultValues: {
      deliveryAvailable: false,
      insuranceAccepted: [],
    },
  });

  const deliveryAvailable = watch('deliveryAvailable');
  const insuranceOptions = [
    'Medicare',
    'Medicaid',
    'Blue Cross Blue Shield',
    'UnitedHealthcare',
    'Aetna',
    'Cigna',
    'Humana',
    'Other'
  ];

  const onSubmit = async (data: PharmacyFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Save pharmacy details to backend
      // This would typically be an API call
      console.log('Pharmacy details:', data);
      
      // Update onboarding step
if (updateOnboardingStep) {
  await updateOnboardingStep('kyc_documents');
}
      
      // Navigate to next step
      router.push('/onboarding/kyc_documents');
    } catch (err) {
      console.error('Error saving pharmacy details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsuranceChange = (insurance: string) => {
    const currentInsurances = watch('insuranceAccepted') || [];
    if (currentInsurances.includes(insurance)) {
      setValue(
        'insuranceAccepted',
        currentInsurances.filter((i) => i !== insurance)
      );
    } else {
      setValue('insuranceAccepted', [...currentInsurances, insurance]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pharmacy Details
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide information about your pharmacy
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="p-4">
              <label htmlFor="pharmacyName" className="block text-sm font-medium text-gray-700">
                Pharmacy Name
              </label>
              <input
                id="pharmacyName"
                type="text"
                {...register('pharmacyName')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.pharmacyName && (
                <p className="mt-1 text-sm text-red-600">{errors.pharmacyName.message}</p>
              )}
            </div>

            <div className="p-4">
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              <input
                id="licenseNumber"
                type="text"
                {...register('licenseNumber')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.licenseNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
              )}
            </div>

            <div className="p-4">
              <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700">
                License Expiry Date
              </label>
              <input
                id="licenseExpiryDate"
                type="date"
                {...register('licenseExpiryDate')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.licenseExpiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.licenseExpiryDate.message}</p>
              )}
            </div>

            <div className="p-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...register('city')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  {...register('state')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  Zip Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  {...register('zipCode')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="pharmacyPhone" className="block text-sm font-medium text-gray-700">
                  Pharmacy Phone
                </label>
                <input
                  id="pharmacyPhone"
                  type="tel"
                  {...register('pharmacyPhone')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.pharmacyPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.pharmacyPhone.message}</p>
                )}
              </div>
            </div>

            <div className="p-4">
              <label htmlFor="operatingHours" className="block text-sm font-medium text-gray-700">
                Operating Hours
              </label>
              <input
                id="operatingHours"
                type="text"
                placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                {...register('operatingHours')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.operatingHours && (
                <p className="mt-1 text-sm text-red-600">{errors.operatingHours.message}</p>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center">
                <input
                  id="deliveryAvailable"
                  type="checkbox"
                  {...register('deliveryAvailable')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="deliveryAvailable" className="ml-2 block text-sm text-gray-700">
                  Delivery Available
                </label>
              </div>
            </div>

            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Accepted
              </label>
              <div className="grid grid-cols-2 gap-2">
                {insuranceOptions.map((insurance) => (
                  <div key={insurance} className="flex items-center">
                    <input
                      id={`insurance-${insurance}`}
                      type="checkbox"
                      checked={watch('insuranceAccepted')?.includes(insurance) || false}
                      onChange={() => handleInsuranceChange(insurance)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`insurance-${insurance}`} className="ml-2 block text-sm text-gray-700">
                      {insurance}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/onboarding/basic_info')}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}