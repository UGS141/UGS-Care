import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { toast } from 'react-toastify';
// User interface is defined locally in this file, no need for external import

interface OnboardingStatus {
  completed: boolean;
  currentStep: string;
  kycStatus: string;
}


interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingStatus: OnboardingStatus | null;
  fetchOnboardingStatus: () => Promise<OnboardingStatus>;
  updateOnboardingStep: (step: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (otp: string, otpType: string) => Promise<boolean>;
  resendOtp: (otpType: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const router = useRouter();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Get user profile
        const response = await api.get<{ user: User }>(API_ENDPOINTS.USER.PROFILE);
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Fetch onboarding status
        await fetchOnboardingStatus();
      } catch (error) {
        // Clear tokens if authentication fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      
      const { user, accessToken, refreshToken } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      // Redirect based on verification status
      if (!user.isEmailVerified) {
        router.push('/auth/verify-email');
      } else {
        router.push('/dashboard');
      }
      
      toast.success('Login successful');
    } catch (error: Error | unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        toast.error((error as any).response?.data?.message || 'Login failed');
      } else {
        toast.error('Login failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      toast.success('Registration successful. Please verify your email.');
void router.push('/auth/verify-email');
    } catch (error: Error | unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        toast.error((error as any).response?.data?.message || 'Registration failed');
      } else {
        toast.error('Registration failed');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      router.push('/auth/login');
      toast.success('Logged out successfully');
    }
  };

  const verifyOtp = async (otp: string, otpType: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post(API_ENDPOINTS.OTP.VERIFY, { otp, type: otpType });
      
      // Update user state with new verification status
      if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        setUser(response.data.user as User);
      }
      
      toast.success('Verification successful');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (otpType: string) => {
    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.OTP.RESEND, { type: otpType });
      toast.success('OTP resent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process request');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
      toast.success('Password reset successful. Please login with your new password.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOnboardingStatus = async (): Promise<OnboardingStatus> => {
    try {
      setIsLoading(true);
      const response = await api.get(API_ENDPOINTS.ONBOARDING.STATUS);
      const status = response.data;
      setOnboardingStatus(status as OnboardingStatus);
      return status as OnboardingStatus;
    } catch (error: any) {
      console.error('Failed to fetch onboarding status:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch onboarding status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingStep = async (step: string): Promise<void> => {
    try {
      setIsLoading(true);
      await api.post(API_ENDPOINTS.ONBOARDING.UPDATE_STEP, { step });
      // Refresh onboarding status after update
      await fetchOnboardingStatus();
      toast.success('Onboarding progress updated');
    } catch (error: any) {
      console.error('Failed to update onboarding step:', error);
      toast.error(error.response?.data?.message || 'Failed to update onboarding step');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    onboardingStatus,
    fetchOnboardingStatus,
    updateOnboardingStep,
    login,
    register,
    logout,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};