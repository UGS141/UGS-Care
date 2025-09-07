// API Configuration

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  // OTP endpoints
  OTP: {
    GENERATE: '/otp/generate',
    VERIFY: '/otp/verify',
    RESEND: '/otp/resend',
  },
  // User endpoints
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_DOCUMENTS: '/users/documents',
    GET_DOCUMENTS: '/users/documents',
  },
  // Onboarding endpoints
  ONBOARDING: {
    STATUS: '/onboarding/status',
    REQUIREMENTS: '/onboarding/requirements/:role',
    UPDATE_STEP: '/onboarding/step',
    PATIENT: '/onboarding/patient',
    DOCTOR: '/onboarding/doctor',
    PHARMACY: '/onboarding/pharmacy',
    HOSPITAL: '/onboarding/hospital',
  },
  // Admin specific endpoints
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:id',
    APPROVE_USER: '/admin/users/:id/approve',
    REJECT_USER: '/admin/users/:id/reject',
    STATISTICS: '/admin/statistics',
    LOGS: '/admin/logs',
  },
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});