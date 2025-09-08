'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function KycPendingPage() {
  const router = useRouter();
  const { user, onboardingStatus } = useAuth() as { user: any; onboardingStatus: { completed: boolean; currentStep: string; kycStatus: string } };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true);

        // If onboarding is completed, redirect to dashboard
        if (onboardingStatus?.completed) {
          router.push('/dashboard');
          return;
        }

        // If onboarding step is not 'kyc_pending', redirect to appropriate step
        if (onboardingStatus?.currentStep !== 'kyc_pending') {
          router.push(`/onboarding/${onboardingStatus?.currentStep}`);
          return;
        }

        setStatus(onboardingStatus?.kycStatus || 'pending');
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();

    // Poll for status updates every 30 seconds
    const intervalId = setInterval(checkStatus, 30000);

    return () => clearInterval(intervalId);
  }, [router, onboardingStatus]);

  const renderStatusMessage = () => {
    switch (status) {
      case 'pending':
        return (
          <>
            <h3 className="text-lg font-medium text-gray-900">KYC Verification Pending</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your documents have been submitted and are currently under review. This process typically takes 1-2 business days.
            </p>
          </>
        );
      case 'rejected':
        return (
          <>
            <h3 className="text-lg font-medium text-red-700">KYC Verification Rejected</h3>
            <p className="mt-2 text-sm text-gray-600">
              Unfortunately, your KYC verification was rejected. Please contact support for more information.
            </p>
            <button
              onClick={() => router.push('/onboarding/kyc_documents')}
              className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Resubmit Documents
            </button>
          </>
        );
      case 'approved':
        return (
          <>
            <h3 className="text-lg font-medium text-green-700">KYC Verification Approved</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your KYC verification has been approved! You will be redirected to the dashboard shortly.
            </p>
          </>
        );
      default:
        return (
          <>
            <h3 className="text-lg font-medium text-gray-900">Status Unknown</h3>
            <p className="mt-2 text-sm text-gray-600">
              We couldn't determine the status of your KYC verification. Please contact support.
            </p>
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            KYC Verification Status
          </h2>
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-6">
            {status === 'pending' && (
              <div className="rounded-full bg-yellow-100 p-3">
                <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {status === 'rejected' && (
              <div className="rounded-full bg-red-100 p-3">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            {status === 'approved' && (
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          <div className="text-center">
            {renderStatusMessage()}
          </div>

          {status === 'pending' && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
