'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
// Define schema and type inline since hospitalSchema module is not found
const hospitalSchema = z.object({
  hospitalName: z.string().min(2, { message: 'Hospital name is required' }),
  registrationNumber: z.string().min(3, { message: 'Registration number is required' }),
  type: z.enum(['Government', 'Private', 'Non-profit', 'Other'], {
    errorMap: () => ({ message: 'Please select a hospital type' }),
  }),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  contactPhone: z.string().min(10, 'Contact phone number is required'),
  contactEmail: z.string().email('Please enter a valid email'),
  bedsCount: z.string().transform(val => parseInt(val, 10) || 0),
  emergencyServices: z.boolean().optional(),
  specialties: z.array(z.string()).optional(),
});

type HospitalFormData = z.infer<typeof hospitalSchema>;

const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<HospitalFormData>({
  resolver: zodResolver(hospitalSchema),
  defaultValues: {
    emergencyServices: false,
    specialties: [],
    bedsCount: 0,
  },
});



const hospitalSchema = z.object({
  hospitalName: z.string().min(2, { message: 'Hospital name is required' }),
  registrationNumber: z.string().min(3, { message: 'Registration number is required' }),
  type: z.enum(['Government', 'Private', 'Non-profit', 'Other'], {
    errorMap: () => ({ message: 'Please select a hospital type' }),
  }),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  contactPhone: z.string().min(10, 'Contact phone number is required'),
  contactEmail: z.string().email('Please enter a valid email'),
  bedsCount: z.string().transform(val => parseInt(val, 10) || 0),
  emergencyServices: z.boolean().optional(),
  specialties: z.array(z.string()).optional(),
});

type HospitalFormData = z.infer<typeof hospitalSchema>;

export default function HospitalDetailsPage() {
  const router = useRouter();
  const { updateOnboardingStep } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      emergencyServices: false,
      specialties: [],
    },
  });

  const specialtyOptions = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Oncology',
    'Gynecology',
    'Dermatology',
    'Psychiatry',
    'Urology',
    'ENT',
    'Ophthalmology',
    'Other'
  ];

  const onSubmit = async (data: HospitalFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Save hospital details to backend using API client
      await api.post(API_ENDPOINTS.ONBOARDING.HOSPITAL, data);
      
      // Update onboarding step
      await updateOnboardingStep('kyc_documents');
      
      // Navigate to next step
      router.push('/onboarding/kyc_documents');
    } catch (err: any) {
      console.error('Error saving hospital details:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialtyChange = (specialty: string) => {
    const currentSpecialties = watch('specialties') || [];
    if (currentSpecialties.includes(specialty)) {
      setValue(
        'specialties',
        currentSpecialties.filter((s) => s !== specialty)
      );
    } else {
      setValue('specialties', [...currentSpecialties, specialty]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hospital Details
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide information about your hospital
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
              <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">
                Hospital Name
              </label>
              <input
                id="hospitalName"
                type="text"
                {...register('hospitalName')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.hospitalName && (
                <p className="mt-1 text-sm text-red-600">{errors.hospitalName.message}</p>
              )}
            </div>

            <div className="p-4">
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <input
                id="registrationNumber"
                type="text"
                {...register('registrationNumber')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.registrationNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div className="p-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Hospital Type
              </label>
              <select
                id="type"
                {...register('type')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select hospital type</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Non-profit">Non-profit</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
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
                <label htmlFor="bedsCount" className="block text-sm font-medium text-gray-700">
                  Number of Beds
                </label>
                <input
                  id="bedsCount"
                  type="number"
                  min="0"
                  {...register('bedsCount')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.bedsCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedsCount.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  {...register('contactPhone')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center">
                <input
                  id="emergencyServices"
                  type="checkbox"
                  {...register('emergencyServices')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="emergencyServices" className="ml-2 block text-sm text-gray-700">
                  Emergency Services Available 24/7
                </label>
              </div>
            </div>

            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties Available
              </label>
              <div className="grid grid-cols-2 gap-2">
                {specialtyOptions.map((specialty) => (
                  <div key={specialty} className="flex items-center">
                    <input
                      id={`specialty-${specialty}`}
                      type="checkbox"
                      checked={watch('specialties')?.includes(specialty) || false}
                      onChange={() => handleSpecialtyChange(specialty)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`specialty-${specialty}`} className="ml-2 block text-sm text-gray-700">
                      {specialty}
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