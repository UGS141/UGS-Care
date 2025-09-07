const authService = require('../services/auth.service');
// Removed unused profileService import
// Remove unused import since kycService is not used in this file
const { catchAsync } = require('../utils/error-handler');
const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const Pharmacy = require('../models/pharmacy.model');
const Hospital = require('../models/hospital.model');

/**
 * Complete patient onboarding
 * @route POST /api/onboarding/patient
 */
exports.patientOnboarding = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const patientData = req.body;
  
  // Validate user role
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Only patients can access this endpoint',
    });
  }
  
  // Check if patient profile already exists
  const existingPatient = await Patient.findOne({ userId });
  
  if (existingPatient) {
    return res.status(400).json({
      success: false,
      message: 'Patient profile already exists',
    });
  }
  
  // Create patient profile
  const patient = await Patient.create({
    userId,
    ...patientData,
  });
  
  // Update user onboarding status
  await User.findByIdAndUpdate(userId, {
    onboardingCompleted: true,
    onboardingStep: 'completed',
  });
  
  // Log the onboarding event
  await authService.logSecurityEvent('onboarding_completed', userId, {
    role: 'patient',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(201).json({
    success: true,
    message: 'Patient profile created successfully',
    data: patient,
  });
});

/**
 * Complete doctor onboarding
 * @route POST /api/onboarding/doctor
 */
exports.doctorOnboarding = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const doctorData = req.body;
  
  // Validate user role
  if (req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Only doctors can access this endpoint',
    });
  }
  
  // Check if doctor profile already exists
  const existingDoctor = await Doctor.findOne({ userId });
  
  if (existingDoctor) {
    return res.status(400).json({
      success: false,
      message: 'Doctor profile already exists',
    });
  }
  
  // Create doctor profile with pending KYC status
  const doctor = await Doctor.create({
    userId,
    ...doctorData,
    kycStatus: 'pending',
  });
  
  // Update user onboarding status
  await User.findByIdAndUpdate(userId, {
    onboardingCompleted: false, // Not fully completed until KYC verification
    onboardingStep: 'kyc_pending',
  });
  
  // Log the onboarding event
  await authService.logSecurityEvent('onboarding_started', userId, {
    role: 'doctor',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(201).json({
    success: true,
    message: 'Doctor profile created successfully. KYC verification pending.',
    data: doctor,
  });
});

/**
 * Complete pharmacy onboarding
 * @route POST /api/onboarding/pharmacy
 */
exports.pharmacyOnboarding = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const pharmacyData = req.body;
  
  // Validate user role
  if (req.user.role !== 'pharmacy') {
    return res.status(403).json({
      success: false,
      message: 'Only pharmacy owners can access this endpoint',
    });
  }
  
  // Check if pharmacy profile already exists
  const existingPharmacy = await Pharmacy.findOne({ ownerId: userId });
  
  if (existingPharmacy) {
    return res.status(400).json({
      success: false,
      message: 'Pharmacy profile already exists',
    });
  }
  
  // Create pharmacy profile with pending status
  const pharmacy = await Pharmacy.create({
    ownerId: userId,
    ...pharmacyData,
    status: 'pending',
  });
  
  // Update user onboarding status
  await User.findByIdAndUpdate(userId, {
    onboardingCompleted: false, // Not fully completed until verification
    onboardingStep: 'verification_pending',
  });
  
  // Log the onboarding event
  await authService.logSecurityEvent('onboarding_started', userId, {
    role: 'pharmacy',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(201).json({
    success: true,
    message: 'Pharmacy profile created successfully. Verification pending.',
    data: pharmacy,
  });
});

/**
 * Complete hospital onboarding
 * @route POST /api/onboarding/hospital
 */
exports.hospitalOnboarding = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const hospitalData = req.body;
  
  // Validate user role
  if (req.user.role !== 'hospital') {
    return res.status(403).json({
      success: false,
      message: 'Only hospital administrators can access this endpoint',
    });
  }
  
  // Check if hospital profile already exists
  const existingHospital = await Hospital.findOne({ ownerId: userId });
  
  if (existingHospital) {
    return res.status(400).json({
      success: false,
      message: 'Hospital profile already exists',
    });
  }
  
  // Create hospital profile with pending status
  const hospital = await Hospital.create({
    ownerId: userId,
    ...hospitalData,
    status: 'pending',
  });
  
  // Update user onboarding status
  await User.findByIdAndUpdate(userId, {
    onboardingCompleted: false, // Not fully completed until verification
    onboardingStep: 'verification_pending',
  });
  
  // Log the onboarding event
  await authService.logSecurityEvent('onboarding_started', userId, {
    role: 'hospital',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(201).json({
    success: true,
    message: 'Hospital profile created successfully. Verification pending.',
    data: hospital,
  });
});

/**
 * Get onboarding status
 * @route GET /api/onboarding/status
 */
exports.getOnboardingStatus = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  
  // Get user with onboarding status
  const user = await User.findById(userId).select('onboardingCompleted onboardingStep');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  // Get role-specific data
  let roleData = null;
  let kycStatus = null;
  
  switch (role) {
    case 'patient':
      roleData = await Patient.findOne({ userId });
      break;
    case 'doctor':
      roleData = await Doctor.findOne({ userId });
      if (roleData) {
        kycStatus = roleData.kycStatus;
      }
      break;
    case 'pharmacy':
      roleData = await Pharmacy.findOne({ ownerId: userId });
      if (roleData) {
        kycStatus = roleData.status;
      }
      break;
    case 'hospital':
      roleData = await Hospital.findOne({ ownerId: userId });
      if (roleData) {
        kycStatus = roleData.status;
      }
      break;
    default:
      break;
  }
  
  res.status(200).json({
    success: true,
    data: {
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      role,
      kycStatus,
      profileExists: !!roleData,
    },
  });
});

/**
 * Update onboarding step
 * @route PATCH /api/onboarding/step
 */
exports.updateOnboardingStep = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { step } = req.body;
  
  if (!step) {
    return res.status(400).json({
      success: false,
      message: 'Onboarding step is required',
    });
  }
  
  // Update user onboarding step
  const user = await User.findByIdAndUpdate(
    userId,
    { onboardingStep: step },
    { new: true }
  ).select('onboardingStep onboardingCompleted');
  
  res.status(200).json({
    success: true,
    message: 'Onboarding step updated',
    data: user,
  });
});

/**
 * Get onboarding requirements for a role
 * @route GET /api/onboarding/requirements/:role
 */
exports.getOnboardingRequirements = catchAsync(async (req, res) => {
  const { role } = req.params;
  
  // Define requirements for each role
  const requirements = {
    patient: {
      steps: ['basic_info', 'medical_history', 'emergency_contacts', 'completed'],
      requiredFields: {
        basic_info: ['dateOfBirth', 'gender', 'bloodGroup'],
        medical_history: ['allergies', 'chronicConditions'],
        emergency_contacts: ['emergencyContacts'],
      },
      kycRequired: false,
    },
    doctor: {
      steps: ['basic_info', 'professional_info', 'kyc_documents', 'kyc_pending', 'kyc_approved', 'completed'],
      requiredFields: {
        basic_info: ['specialization', 'qualifications'],
        professional_info: ['experience', 'licenseNumber', 'licenseExpiryDate'],
        kyc_documents: ['kycDocuments'],
      },
      kycRequired: true,
      kycDocuments: [
        { type: 'identity_proof', required: true },
        { type: 'medical_license', required: true },
        { type: 'medical_degree', required: true },
        { type: 'specialization_certificate', required: false },
      ],
    },
    pharmacy: {
      steps: ['basic_info', 'business_info', 'verification_documents', 'verification_pending', 'verification_approved', 'completed'],
      requiredFields: {
        basic_info: ['name', 'address', 'contactPhone', 'contactEmail'],
        business_info: ['licenseNumber', 'licenseExpiryDate', 'gstin', 'operatingHours'],
        verification_documents: ['licenseDocument', 'gstinDocument'],
      },
      kycRequired: true,
      kycDocuments: [
        { type: 'pharmacy_license', required: true },
        { type: 'gstin_certificate', required: true },
        { type: 'owner_id_proof', required: true },
        { type: 'establishment_proof', required: true },
      ],
    },
    hospital: {
      steps: ['basic_info', 'facility_info', 'verification_documents', 'verification_pending', 'verification_approved', 'completed'],
      requiredFields: {
        basic_info: ['name', 'type', 'address', 'contactPhone', 'contactEmail'],
        facility_info: ['registrationNumber', 'licenseNumber', 'licenseExpiryDate', 'gstin', 'operatingHours', 'services', 'specialties'],
        verification_documents: ['registrationDocument', 'licenseDocument', 'gstinDocument'],
      },
      kycRequired: true,
      kycDocuments: [
        { type: 'hospital_registration', required: true },
        { type: 'hospital_license', required: true },
        { type: 'gstin_certificate', required: true },
        { type: 'accreditation_certificate', required: false },
      ],
    },
  };
  
  if (!requirements[role]) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role',
    });
  }
  
  res.status(200).json({
    success: true,
    data: requirements[role],
  });
});