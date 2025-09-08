'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

// Define the contact schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().optional(),
});

// Define the form schema
const formSchema = z.object({
  emergencyContacts: z.array(contactSchema).min(1, 'At least one emergency contact is required'),
});

type ContactData = z.infer<typeof contactSchema>;
type FormData = z.infer<typeof formSchema>;

export default function EmergencyContactsPage() {
  const router = useRouter();
  const { user, updateOnboardingStep } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emergencyContacts: [{ name: '', relationship: '', phone: '', address: '' }],
    },
  });

  // Setup field array for dynamic contacts
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emergencyContacts',
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // For patient role, this is the final step
      // Submit the onboarding data to complete the process
      // TODO: Implement submitOnboarding function or import it
      // For now, we'll just log the data
      console.log('Submitting onboarding data:', { role: 'patient', data });

      // Update the onboarding step to completed
      await updateOnboardingStep('completed');

      // Navigate to the dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
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
            Emergency Contacts
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide at least one emergency contact
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
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-md bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium">Contact {index + 1}</h3>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor={`emergencyContacts.${index}.name`} className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id={`emergencyContacts.${index}.name`}
                    type="text"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                    {...register(`emergencyContacts.${index}.name` as const)}
                  />
                  {errors.emergencyContacts?.[index]?.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContacts[index]?.name?.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor={`emergencyContacts.${index}.relationship`} className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    id={`emergencyContacts.${index}.relationship`}
                    type="text"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="e.g., Spouse, Parent, Sibling"
                    {...register(`emergencyContacts.${index}.relationship` as const)}
                  />
                  {errors.emergencyContacts?.[index]?.relationship && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContacts[index]?.relationship?.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor={`emergencyContacts.${index}.phone`} className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id={`emergencyContacts.${index}.phone`}
                    type="tel"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Phone Number"
                    {...register(`emergencyContacts.${index}.phone` as const)}
                  />
                  {errors.emergencyContacts?.[index]?.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContacts[index]?.phone?.message}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor={`emergencyContacts.${index}.address`} className="block text-sm font-medium text-gray-700 mb-1">
                    Address (Optional)
                  </label>
                  <textarea
                    id={`emergencyContacts.${index}.address`}
                    rows={2}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Address"
                    {...register(`emergencyContacts.${index}.address` as const)}
                  />
                  {errors.emergencyContacts?.[index]?.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContacts[index]?.address?.message}</p>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ name: '', relationship: '', phone: '', address: '' })}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Another Contact
            </button>
          </div>

          {errors.emergencyContacts && errors.emergencyContacts.root && (
            <p className="text-red-500 text-xs mt-1">{errors.emergencyContacts.root.message}</p>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/onboarding/medical_history')}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Completing...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}