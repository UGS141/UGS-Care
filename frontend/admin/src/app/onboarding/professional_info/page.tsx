'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

// Define the form schema
const formSchema = z.object({
  experience: z.string().min(1, 'Years of experience is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiryDate: z.string().min(1, 'License expiry date is required'),
  clinicAddress: z.string().optional(),
  consultationFees: z.string().optional(),
  availableForHomeVisit: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ProfessionalInfoPage() {
  const router = useRouter();
  const { user, updateOnboardingStep } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availableForHomeVisit: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update the onboarding step in the backend
      await updateOnboardingStep('kyc_documents');

      // Navigate to the next step
      router.push('/onboarding/kyc_documents');
    } catch (err) {
      console.error('Error updating onboarding step:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Professional Information
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide your professional details
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
            <div className="mb-4">
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                id="experience"
                type="number"
                min="0"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Years of Experience"
                {...register('experience')}
              />
              {errors.experience && (
                <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Medical License Number
              </label>
              <input
                id="licenseNumber"
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="License Number"
                {...register('licenseNumber')}
              />
              {errors.licenseNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                License Expiry Date
              </label>
              <input
                id="licenseExpiryDate"
                type="date"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                {...register('licenseExpiryDate')}
              />
              {errors.licenseExpiryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.licenseExpiryDate.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Clinic/Hospital Address (Optional)
              </label>
              <textarea
                id="clinicAddress"
                rows={3}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Clinic/Hospital Address"
                {...register('clinicAddress')}
              />
              {errors.clinicAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.clinicAddress.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="consultationFees" className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fees (Optional)
              </label>
              <input
                id="consultationFees"
                type="number"
                min="0"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Consultation Fees (in INR)"
                {...register('consultationFees')}
              />
              {errors.consultationFees && (
                <p className="text-red-500 text-xs mt-1">{errors.consultationFees.message}</p>
              )}
            </div>

            <div className="mb-4 flex items-center">
              <input
                id="availableForHomeVisit"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                {...register('availableForHomeVisit')}
              />
              <label htmlFor="availableForHomeVisit" className="ml-2 block text-sm text-gray-900">
                Available for home visits
              </label>
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
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}