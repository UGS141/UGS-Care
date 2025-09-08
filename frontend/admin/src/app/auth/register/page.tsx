// 'use client';

// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';

// // Form validation schema
// const registerSchema = z.object({
//   name: z.string().min(2, 'Name must be at least 2 characters'),
//   email: z.string().email('Please enter a valid email address'),
//   phone: z.string().min(10, 'Phone number must be at least 10 digits'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
//   confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: 'Passwords do not match',
//   path: ['confirmPassword'],
// });

// type RegisterFormData = z.infer<typeof registerSchema>;

// export default function RegisterPage() {
//   const { register: registerUser, isLoading } = useAuth();
//   const [error, setError] = useState<string | null>(null);
  
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       name: '',
//       email: '',
//       phone: '',
//       password: '',
//       confirmPassword: '',
//     },
//   });

//   const onSubmit = async (data: RegisterFormData) => {
//     try {
//       setError(null);
//       await registerUser({
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         phone: data.phone,
//         role: 'admin', // Default role for admin portal
//       });
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('Registration failed. Please try again.');
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create Admin Account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Register for UGS Care Admin Portal
//           </p>
//         </div>
        
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div className="mb-4">
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                 Full Name
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 autoComplete="name"
//                 className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Full Name"
//                 {...register('name')}
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
//               )}
//             </div>
            
//             <div className="mb-4">
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 autoComplete="email"
//                 className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Email Address"
//                 {...register('email')}
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
//               )}
//             </div>
            
//             <div className="mb-4">
//               <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
//                 Phone Number
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 autoComplete="tel"
//                 className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Phone Number"
//                 {...register('phone')}
//               />
//               {errors.phone && (
//                 <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
//               )}
//             </div>
            
//             <div className="mb-4">
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 autoComplete="new-password"
//                 className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 {...register('password')}
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
//               )}
//             </div>
            
//             <div className="mb-4">
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirm Password
//               </label>
//               <input
//                 id="confirmPassword"
//                 type="password"
//                 autoComplete="new-password"
//                 className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Confirm Password"
//                 {...register('confirmPassword')}
//               />
//               {errors.confirmPassword && (
//                 <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
//               )}
//             </div>
//           </div>

//           {error && (
//             <div className="rounded-md bg-red-50 p-4">
//               <div className="flex">
//                 <div className="ml-3">
//                   <h3 className="text-sm font-medium text-red-800">{error}</h3>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading ? 'Registering...' : 'Register'}
//             </button>
//           </div>
//         </form>

//         <div className="text-center mt-4">
//           <p className="text-sm text-gray-600">
//             Already have an account?{' '}
//             <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


import Navbar from "@/app/landing/Navbar";
import Hero from "@/app/landing/Hero";
import Slider from "@/app/landing/Slider";
import Features from "@/app/landing/Features";
import About from "@/app/landing/About";
import Footer from "@/app/landing/Footer";
// Remove unused import since Swiper and SwiperSlide are not used in this file
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Slider />
      <Features />
      <About />
      <Footer />
    </main>
  );
}
