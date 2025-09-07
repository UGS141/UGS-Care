const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const Pharmacy = require('../models/pharmacy.model');
const Hospital = require('../models/hospital.model');
const AuditLog = require('../models/audit-log.model');
const bcrypt = require('bcryptjs');

/**
 * Service for managing user profiles across different roles
 */
class ProfileService {
  /**
   * Get user profile with role-specific data
   * @param {string} userId - User ID
   * @returns {Object} - User profile with role data
   */
  async getProfile(userId) {
    try {
      // Get basic user data
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get role-specific data
      const roleData = await this.getRoleData(user);
      
      // Remove sensitive data
      user.password = undefined;
      
      return {
        user,
        roleData,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Object} - Updated user profile
   */
  async updateProfile(userId, userData) {
    try {
      // Get user
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if email or phone is being changed and if it already exists
      if (userData.email && userData.email !== user.email) {
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          throw new Error('Email already in use');
        }
        
        // Reset email verification if email is changed
        userData.emailVerified = false;
      }
      
      if (userData.phone && userData.phone !== user.phone) {
        const existingUser = await User.findOne({ phone: userData.phone });
        
        if (existingUser) {
          throw new Error('Phone number already in use');
        }
        
        // Reset phone verification if phone is changed
        userData.phoneVerified = false;
      }
      
      // Handle password update separately
      if (userData.password) {
        // Verify current password if provided
        if (userData.currentPassword) {
          const isPasswordValid = await bcrypt.compare(userData.currentPassword, user.password);
          
          if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
          }
        }
        
        // Password will be hashed by pre-save middleware
      }
      
      // Update user data
      Object.keys(userData).forEach(key => {
        // Skip role change (role can only be changed by admin)
        if (key !== 'role') {
          user[key] = userData[key];
        }
      });
      
      await user.save();
      
      // Log profile update
      await this.logProfileEvent(userId, 'update', 'user', {
        updatedFields: Object.keys(userData).filter(key => key !== 'password' && key !== 'currentPassword'),
      });
      
      // Remove sensitive data
      user.password = undefined;
      
      return { user };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Update role-specific profile data
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {Object} roleData - Updated role data
   * @returns {Object} - Updated role profile
   */
  async updateRoleProfile(userId, role, roleData) {
    try {
      // Validate role
      if (!['patient', 'doctor', 'pharmacy', 'hospital'].includes(role)) {
        throw new Error('Invalid role');
      }
      
      // Get user
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user has the specified role
      if (user.role !== role) {
        throw new Error(`User does not have role: ${role}`);
      }
      
      let updatedProfile;
      
      // Update role-specific data
      switch (role) {
        case 'patient':
          updatedProfile = await this.updatePatientProfile(userId, roleData);
          break;
        case 'doctor':
          updatedProfile = await this.updateDoctorProfile(userId, roleData);
          break;
        case 'pharmacy':
          updatedProfile = await this.updatePharmacyProfile(userId, roleData);
          break;
        case 'hospital':
          updatedProfile = await this.updateHospitalProfile(userId, roleData);
          break;
      }
      
      // Log profile update
      await this.logProfileEvent(userId, 'update', role, {
        updatedFields: Object.keys(roleData),
      });
      
      return { roleData: updatedProfile };
    } catch (error) {
      console.error('Update role profile error:', error);
      throw error;
    }
  }

  /**
   * Update patient profile
   * @param {string} userId - User ID
   * @param {Object} patientData - Updated patient data
   * @returns {Object} - Updated patient profile
   */
  async updatePatientProfile(userId, patientData) {
    // Find patient profile
    let patient = await Patient.findOne({ userId });
    
    if (!patient) {
      // Create patient profile if it doesn't exist
      patient = await Patient.create({
        userId,
        ...patientData,
      });
    } else {
      // Update existing patient profile
      Object.keys(patientData).forEach(key => {
        patient[key] = patientData[key];
      });
      
      await patient.save();
    }
    
    return patient;
  }

  /**
   * Update doctor profile
   * @param {string} userId - User ID
   * @param {Object} doctorData - Updated doctor data
   * @returns {Object} - Updated doctor profile
   */
  async updateDoctorProfile(userId, doctorData) {
    // Find doctor profile
    let doctor = await Doctor.findOne({ userId });
    
    if (!doctor) {
      // Create doctor profile if it doesn't exist
      doctor = await Doctor.create({
        userId,
        ...doctorData,
        licenseVerified: false,
        kycStatus: 'pending',
      });
    } else {
      // Prevent updating sensitive fields
      const protectedFields = ['licenseVerified', 'kycStatus', 'kycDocuments', 'kycRemarks', 'kycVerifiedAt'];
      
      // Update existing doctor profile
      Object.keys(doctorData).forEach(key => {
        if (!protectedFields.includes(key)) {
          doctor[key] = doctorData[key];
        }
      });
      
      await doctor.save();
    }
    
    return doctor;
  }

  /**
   * Update pharmacy profile
   * @param {string} userId - User ID
   * @param {Object} pharmacyData - Updated pharmacy data
   * @returns {Object} - Updated pharmacy profile
   */
  async updatePharmacyProfile(userId, pharmacyData) {
    // Find pharmacy profile
    let pharmacy = await Pharmacy.findOne({ ownerId: userId });
    
    if (!pharmacy) {
      // Create pharmacy profile if it doesn't exist
      pharmacy = await Pharmacy.create({
        ownerId: userId,
        ...pharmacyData,
        licenseVerified: false,
        status: 'pending',
      });
    } else {
      // Prevent updating sensitive fields
      const protectedFields = ['licenseVerified', 'status', 'kycDocuments', 'kycRemarks', 'kycVerifiedAt'];
      
      // Update existing pharmacy profile
      Object.keys(pharmacyData).forEach(key => {
        if (!protectedFields.includes(key)) {
          pharmacy[key] = pharmacyData[key];
        }
      });
      
      await pharmacy.save();
    }
    
    return pharmacy;
  }

  /**
   * Update hospital profile
   * @param {string} userId - User ID
   * @param {Object} hospitalData - Updated hospital data
   * @returns {Object} - Updated hospital profile
   */
  async updateHospitalProfile(userId, hospitalData) {
    // Find hospital profile
    let hospital = await Hospital.findOne({ ownerId: userId });
    
    if (!hospital) {
      // Create hospital profile if it doesn't exist
      hospital = await Hospital.create({
        ownerId: userId,
        ...hospitalData,
        licenseVerified: false,
        status: 'pending',
      });
    } else {
      // Prevent updating sensitive fields
      const protectedFields = ['licenseVerified', 'status', 'kycDocuments', 'kycRemarks', 'kycVerifiedAt'];
      
      // Update existing hospital profile
      Object.keys(hospitalData).forEach(key => {
        if (!protectedFields.includes(key)) {
          hospital[key] = hospitalData[key];
        }
      });
      
      await hospital.save();
    }
    
    return hospital;
  }

  /**
   * Get role-specific data for a user
   * @param {Object} user - User object
   * @returns {Object} - Role-specific data
   */
  async getRoleData(user) {
    try {
      let roleData = null;

      switch (user.role) {
        case 'patient':
          roleData = await Patient.findOne({ userId: user._id });
          break;
        case 'doctor':
          roleData = await Doctor.findOne({ userId: user._id });
          break;
        case 'pharmacy':
          roleData = await Pharmacy.findOne({ ownerId: user._id });
          break;
        case 'hospital':
          roleData = await Hospital.findOne({ ownerId: user._id });
          break;
        default:
          break;
      }

      return roleData;
    } catch (error) {
      console.error('Get role data error:', error);
      return null;
    }
  }

  /**
   * Log profile events for audit
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {string} entityType - Type of entity
   * @param {Object} details - Event details
   */
  async logProfileEvent(userId, action, entityType, details = {}) {
    try {
      await AuditLog.create({
        actor: {
          userId,
        },
        action: `profile_${action}`,
        entityType,
        entityId: userId,
        status: 'success',
        details,
      });
    } catch (error) {
      console.error('Log profile event error:', error);
      // Don't throw error to prevent disrupting the main flow
    }
  }
}

module.exports = new ProfileService();