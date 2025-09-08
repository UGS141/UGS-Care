'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentUpload {
  type: string;
  file: File | null;
  uploaded: boolean;
  required: boolean;
}

export default function KycDocumentsPage() {
  const router = useRouter();
  const { updateOnboardingStep } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Define required documents based on role
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: 'identity_proof', file: null, uploaded: false, required: true },
    { type: 'medical_license', file: null, uploaded: false, required: true },
    { type: 'medical_degree', file: null, uploaded: false, required: true },
    { type: 'specialization_certificate', file: null, uploaded: false, required: false },
  ]);

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newDocuments = [...documents];
      newDocuments[index].file = event.target.files[0];
      newDocuments[index].uploaded = true;
      setDocuments(newDocuments);
    }
  };

  const removeFile = (index: number) => {
    const newDocuments = [...documents];
    newDocuments[index].file = null;
    newDocuments[index].uploaded = false;
    setDocuments(newDocuments);
    
    // Reset the file input
    if (fileInputRefs.current[documents[index].type]) {
      const input = fileInputRefs.current[documents[index].type];
      if (input) {
        input.value = '';
      }
    }
  };

  const validateDocuments = () => {
    // Check if all required documents are uploaded
    const missingRequired = documents.filter(doc => doc.required && !doc.uploaded);
    if (missingRequired.length > 0) {
      setError(`Please upload all required documents: ${missingRequired.map(doc => doc.type.replace('_', ' ')).join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDocuments()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Prepare document data for submission
      const documentData = {
        kycDocuments: documents.filter(doc => doc.uploaded).map(doc => ({
          type: doc.type,
          fileName: doc.file?.name,
          fileSize: doc.file?.size,
          fileType: doc.file?.type,
        })),
      };

      // Submit the onboarding data
      // Import and call the submitOnboarding function from your API service
      await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'doctor',
          documents: documentData
        })
      });

      // Update the onboarding step to pending KYC verification
      await updateOnboardingStep('kyc_pending');

      // Navigate to the pending page
      router.push('/onboarding/kyc_pending');
    } catch (err) {
      console.error('Error submitting KYC documents:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            KYC Document Upload
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please upload the required documents for verification
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={doc.type} className="p-4 border border-gray-200 rounded-md bg-white">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-md font-medium">{getDocumentLabel(doc.type)}</h3>
                    {doc.required && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                </div>

                {!doc.uploaded ? (
                  <div className="mt-2">
                    <label
                      htmlFor={`file-${doc.type}`}
                      className="cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-block"
                    >
                      Choose File
                    </label>
                    <input
                      id={`file-${doc.type}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(index, e)}
                      ref={el => {
                        fileInputRefs.current[doc.type] = el;
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm truncate max-w-xs">{doc.file?.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/onboarding/professional_info')}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}