'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ✅ Zod schema
const hospitalSchema = z.object({
  hospitalName: z.string().min(2, { message: 'Hospital name is required' }),
  hospitalCode: z.string().min(1, { message: 'Hospital code is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone must be 10 digits' }),
});

// ✅ Types inferred from schema
type HospitalFormInputs = z.infer<typeof hospitalSchema>;

export default function HospitalDetailsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HospitalFormInputs>({
    resolver: zodResolver(hospitalSchema),
  });

  const onSubmit: SubmitHandler<HospitalFormInputs> = (data) => {
    console.log('Hospital Details:', data);
    alert(`Hospital "${data.hospitalName}" saved successfully!`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Hospital Details</h1>

        {/* Hospital Name */}
        <div>
          <label className="block mb-1 font-medium">Hospital Name</label>
          <input
            {...register('hospitalName')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter hospital name"
          />
          {errors.hospitalName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.hospitalName.message}
            </p>
          )}
        </div>

        {/* Hospital Code */}
        <div>
          <label className="block mb-1 font-medium">Hospital Code</label>
          <input
            {...register('hospitalCode')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter hospital code"
          />
          {errors.hospitalCode && (
            <p className="text-red-500 text-sm mt-1">
              {errors.hospitalCode.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 font-medium">Address</label>
          <textarea
            {...register('address')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter hospital address"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 font-medium">Phone Number</label>
          <input
            {...register('phone')}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter 10-digit phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Save Hospital
        </button>
      </form>
    </div>
  );
}
