'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [requirements, setRequirements] = useState<any>(null);

  useEffect(() => {
    async function fetchOnboardingData() {
      try {
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Get onboarding status
        const status = await fetch('/api/onboarding/status').then(res => res.json());
        setOnboardingStatus(status);

        // Get requirements for the user's role
        if (user.role) {
          const reqs = await fetch(`/api/onboarding/requirements/${user.role}`).then(res => res.json());
          setRequirements(reqs);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
        setLoading(false);
      }
    }

    fetchOnboardingData();
  }, [user, router]);

  // Redirect to appropriate step if onboarding is in progress
  useEffect(() => {
    if (!loading && onboardingStatus && requirements) {
      const { onboardingStep } = onboardingStatus;
      
      if (onboardingStep && onboardingStep !== 'completed') {
        router.push(`/onboarding/${onboardingStep}`);
      } else if (onboardingStatus.onboardingCompleted) {
        router.push('/dashboard');
      }
    }
  }, [loading, onboardingStatus, requirements, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to UGS Care
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get you set up with your account
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Onboarding Process</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete the following steps to set up your account:
              </p>
              
              {requirements && requirements.steps && (
                <ul className="mt-3 space-y-2">
                  {requirements.steps.map((step: string, index: number) => (
                    <li key={step} className="flex items-center">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                      </span>
                      <span className="text-sm text-gray-700">
                        {step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="mt-4">
                <button
                  onClick={() => router.push('/onboarding/basic_info')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Onboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}