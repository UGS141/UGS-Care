const Doctor = require('../models/doctor.model');
const Pharmacy = require('../models/pharmacy.model');
const Hospital = require('../models/hospital.model');
const User = require('../models/user.model');
const AuditLog = require('../models/audit-log.model');

/**
 * Service for handling KYC verification processes
 */
class KYCService {
  /**
   * Submit KYC documents for verification
   * @param {string} userId - User ID
   * @param {string} role - User role (doctor, pharmacy, hospital)
   * @param {Object} documents - KYC documents
   * @returns {Object} - Submission result
   */
  async submitDocuments(userId, role, documents) {
    try {
      // Validate role
      if (!['doctor', 'pharmacy', 'hospital'].includes(role)) {
        throw new Error('Invalid role for KYC verification');
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user role matches
      if (user.role !== role) {
        throw new Error(`User role (${user.role}) does not match requested role (${role})`);
      }

      let result;

      // Process based on role
      switch (role) {
        case 'doctor':
          result = await this.processDoctorKYC(userId, documents);
          break;
        case 'pharmacy':
          result = await this.processPharmacyKYC(userId, documents);
          break;
        case 'hospital':
          result = await this.processHospitalKYC(userId, documents);
          break;
      }

      // Log the KYC submission
      await this.logKYCEvent(userId, role, 'submit', {
        documentTypes: Object.keys(documents),
      });

      return result;
    } catch (error) {
      console.error('Submit KYC documents error:', error);
      throw error;
    }
  }

  /**
   * Process doctor KYC documents
   * @param {string} userId - User ID
   * @param {Object} documents - KYC documents
   * @returns {Object} - Processing result
   */
  async processDoctorKYC(userId, documents) {
    // Find doctor profile
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      throw new Error('Doctor profile not found');
    }

    // Validate required documents
    const requiredDocs = ['medicalLicense', 'identityProof'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc]);

    if (missingDocs.length > 0) {
      throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    // Update doctor profile with documents
    doctor.kycDocuments = {
      ...doctor.kycDocuments,
      ...documents,
      submittedAt: new Date(),
    };

    // Update KYC status
    doctor.kycStatus = 'pending';
    await doctor.save();

    return {
      success: true,
      message: 'Doctor KYC documents submitted successfully',
      status: 'pending',
    };
  }

  /**
   * Process pharmacy KYC documents
   * @param {string} userId - User ID
   * @param {Object} documents - KYC documents
   * @returns {Object} - Processing result
   */
  async processPharmacyKYC(userId, documents) {
    // Find pharmacy profile
    const pharmacy = await Pharmacy.findOne({ ownerId: userId });
    if (!pharmacy) {
      throw new Error('Pharmacy profile not found');
    }

    // Validate required documents
    const requiredDocs = ['pharmacyLicense', 'businessRegistration', 'gstCertificate'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc]);

    if (missingDocs.length > 0) {
      throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    // Update pharmacy profile with documents
    pharmacy.kycDocuments = {
      ...pharmacy.kycDocuments,
      ...documents,
      submittedAt: new Date(),
    };

    // Update status
    pharmacy.status = 'pending';
    await pharmacy.save();

    return {
      success: true,
      message: 'Pharmacy KYC documents submitted successfully',
      status: 'pending',
    };
  }

  /**
   * Process hospital KYC documents
   * @param {string} userId - User ID
   * @param {Object} documents - KYC documents
   * @returns {Object} - Processing result
   */
  async processHospitalKYC(userId, documents) {
    // Find hospital profile
    const hospital = await Hospital.findOne({ ownerId: userId });
    if (!hospital) {
      throw new Error('Hospital profile not found');
    }

    // Validate required documents
    const requiredDocs = ['hospitalRegistration', 'accreditationCertificate', 'gstCertificate'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc]);

    if (missingDocs.length > 0) {
      throw new Error(`Missing required documents: ${missingDocs.join(', ')}`);
    }

    // Update hospital profile with documents
    hospital.kycDocuments = {
      ...hospital.kycDocuments,
      ...documents,
      submittedAt: new Date(),
    };

    // Update status
    hospital.status = 'pending';
    await hospital.save();

    return {
      success: true,
      message: 'Hospital KYC documents submitted successfully',
      status: 'pending',
    };
  }

  /**
   * Verify KYC documents (admin function)
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {Object} verificationData - Verification data
   * @param {string} adminId - Admin user ID
   * @returns {Object} - Verification result
   */
  async verifyDocuments(userId, role, verificationData, adminId) {
    try {
      const { status, remarks } = verificationData;

      // Validate status
      if (!['approved', 'rejected', 'pending_resubmission'].includes(status)) {
        throw new Error('Invalid verification status');
      }

      let result;

      // Process based on role
      switch (role) {
        case 'doctor':
          result = await this.verifyDoctorKYC(userId, status, remarks);
          break;
        case 'pharmacy':
          result = await this.verifyPharmacyKYC(userId, status, remarks);
          break;
        case 'hospital':
          result = await this.verifyHospitalKYC(userId, status, remarks);
          break;
        default:
          throw new Error('Invalid role for KYC verification');
      }

      // Update user status if approved
      if (status === 'approved') {
        await User.findByIdAndUpdate(userId, { status: 'active' });
      }

      // Log the verification event
      await this.logKYCEvent(userId, role, 'verify', {
        status,
        remarks,
        verifiedBy: adminId,
      });

      return result;
    } catch (error) {
      console.error('Verify KYC documents error:', error);
      throw error;
    }
  }

  /**
   * Verify doctor KYC documents
   * @param {string} userId - User ID
   * @param {string} status - Verification status
   * @param {string} remarks - Verification remarks
   * @returns {Object} - Verification result
   */
  async verifyDoctorKYC(userId, status, remarks) {
    // Find doctor profile
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      throw new Error('Doctor profile not found');
    }

    // Update KYC status
    doctor.kycStatus = status;
    doctor.kycRemarks = remarks;
    doctor.kycVerifiedAt = new Date();

    // Update license verification status if approved
    if (status === 'approved') {
      doctor.licenseVerified = true;
    }

    await doctor.save();

    return {
      success: true,
      message: `Doctor KYC verification ${status}`,
      status,
    };
  }

  /**
   * Verify pharmacy KYC documents
   * @param {string} userId - User ID
   * @param {string} status - Verification status
   * @param {string} remarks - Verification remarks
   * @returns {Object} - Verification result
   */
  async verifyPharmacyKYC(userId, status, remarks) {
    // Find pharmacy profile
    const pharmacy = await Pharmacy.findOne({ ownerId: userId });
    if (!pharmacy) {
      throw new Error('Pharmacy profile not found');
    }

    // Map KYC status to pharmacy status
    let pharmacyStatus;
    switch (status) {
      case 'approved':
        pharmacyStatus = 'active';
        break;
      case 'rejected':
        pharmacyStatus = 'rejected';
        break;
      case 'pending_resubmission':
        pharmacyStatus = 'pending';
        break;
      default:
        pharmacyStatus = 'pending';
    }

    // Update pharmacy status
    pharmacy.status = pharmacyStatus;
    pharmacy.kycRemarks = remarks;
    pharmacy.kycVerifiedAt = new Date();

    // Update license verification status if approved
    if (status === 'approved') {
      pharmacy.licenseVerified = true;
    }

    await pharmacy.save();

    return {
      success: true,
      message: `Pharmacy KYC verification ${status}`,
      status,
    };
  }

  /**
   * Verify hospital KYC documents
   * @param {string} userId - User ID
   * @param {string} status - Verification status
   * @param {string} remarks - Verification remarks
   * @returns {Object} - Verification result
   */
  async verifyHospitalKYC(userId, status, remarks) {
    // Find hospital profile
    const hospital = await Hospital.findOne({ ownerId: userId });
    if (!hospital) {
      throw new Error('Hospital profile not found');
    }

    // Map KYC status to hospital status
    let hospitalStatus;
    switch (status) {
      case 'approved':
        hospitalStatus = 'active';
        break;
      case 'rejected':
        hospitalStatus = 'rejected';
        break;
      case 'pending_resubmission':
        hospitalStatus = 'pending';
        break;
      default:
        hospitalStatus = 'pending';
    }

    // Update hospital status
    hospital.status = hospitalStatus;
    hospital.kycRemarks = remarks;
    hospital.kycVerifiedAt = new Date();

    // Update license verification status if approved
    if (status === 'approved') {
      hospital.licenseVerified = true;
    }

    await hospital.save();

    return {
      success: true,
      message: `Hospital KYC verification ${status}`,
      status,
    };
  }

  /**
   * Get KYC status for a user
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @returns {Object} - KYC status
   */
  async getKYCStatus(userId, role) {
    try {
      let status, documents, remarks, verifiedAt, submittedAt;

      switch (role) {
        case 'doctor': {
          const doctor = await Doctor.findOne({ userId });
          if (!doctor) {
            throw new Error('Doctor profile not found');
          }
          status = doctor.kycStatus;
          documents = doctor.kycDocuments;
          remarks = doctor.kycRemarks;
          verifiedAt = doctor.kycVerifiedAt;
          submittedAt = doctor.kycDocuments?.submittedAt;
          break;
        }
        case 'pharmacy': {
          const pharmacy = await Pharmacy.findOne({ ownerId: userId });
          if (!pharmacy) {
            throw new Error('Pharmacy profile not found');
          }
          status = pharmacy.status;
          documents = pharmacy.kycDocuments;
          remarks = pharmacy.kycRemarks;
          verifiedAt = pharmacy.kycVerifiedAt;
          submittedAt = pharmacy.kycDocuments?.submittedAt;
          break;
        }
        case 'hospital': {
          const hospital = await Hospital.findOne({ ownerId: userId });
          if (!hospital) {
            throw new Error('Hospital profile not found');
          }
          status = hospital.status;
          documents = hospital.kycDocuments;
          remarks = hospital.kycRemarks;
          verifiedAt = hospital.kycVerifiedAt;
          submittedAt = hospital.kycDocuments?.submittedAt;
          break;
        }
        default:
          throw new Error('Invalid role for KYC verification');
      }

      return {
        status,
        documents,
        remarks,
        verifiedAt,
        submittedAt,
      };
    } catch (error) {
      console.error('Get KYC status error:', error);
      throw error;
    }
  }

  /**
   * Log KYC events for audit
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @param {string} action - Action performed
   * @param {Object} details - Event details
   */
  async logKYCEvent(userId, role, action, details = {}) {
    try {
      await AuditLog.create({
        actor: {
          userId: details.verifiedBy || userId,
          role: details.verifiedBy ? 'admin' : role,
        },
        action: `kyc_${action}`,
        entityType: role,
        entityId: userId,
        status: details.status || 'success',
        details,
      });
    } catch (error) {
      console.error('Log KYC event error:', error);
      // Don't throw error to prevent disrupting the main flow
    }
  }
}

module.exports = new KYCService();