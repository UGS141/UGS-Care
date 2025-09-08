'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

// Define the form schema
const formSchema = z.object({
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  pastSurgeries: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function MedicalHistoryPage() {
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
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update the onboarding step in the backend
      await updateOnboardingStep('emergency_contacts');

      // Navigate to the next step
      router.push('/onboarding/emergency_contacts');
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
            Medical History
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide your medical history information
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
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies
              </label>
              <textarea
                id="allergies"
                rows={3}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="List any allergies you have (medications, food, etc.)"
                {...register('allergies')}
              />
              {errors.allergies && (
                <p className="text-red-500 text-xs mt-1">{errors.allergies.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="chronicConditions" className="block text-sm font-medium text-gray-700 mb-1">
                Chronic Conditions
              </label>
              <textarea
                id="chronicConditions"
                rows={3}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="List any chronic conditions you have (diabetes, hypertension, etc.)"
                {...register('chronicConditions')}
              />
              {errors.chronicConditions && (
                <p className="text-red-500 text-xs mt-1">{errors.chronicConditions.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="currentMedications" className="block text-sm font-medium text-gray-700 mb-1">
                Current Medications
              </label>
              <textarea
                id="currentMedications"
                rows={3}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="List any medications you are currently taking"
                {...register('currentMedications')}
              />
              {errors.currentMedications && (
                <p className="text-red-500 text-xs mt-1">{errors.currentMedications.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="pastSurgeries" className="block text-sm font-medium text-gray-700 mb-1">
                Past Surgeries
              </label>
              <textarea
                id="pastSurgeries"
                rows={3}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="List any surgeries you have had in the past"
                {...register('pastSurgeries')}
              />
              {errors.pastSurgeries && (
                <p className="text-red-500 text-xs mt-1">{errors.pastSurgeries.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="familyMedicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                Family Medical History
              </label>
              <textarea
                id="familyMedicalHistory"
                rows={3}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="List any relevant family medical history"
                {...register('familyMedicalHistory')}
              />
              {errors.familyMedicalHistory && (
                <p className="text-red-500 text-xs mt-1">{errors.familyMedicalHistory.message}</p>
              )}
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