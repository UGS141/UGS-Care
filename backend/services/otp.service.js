const { OTP } = require('../models/security.model');
const User = require('../models/user.model');
const crypto = require('crypto');
const redisClient = require('../config/redis');

/**
 * Service for handling OTP generation, verification, and management
 * with Redis integration for improved performance and security
 */
class OTPService {
  constructor() {
    this.redisEnabled = true;
    this.otpExpirySeconds = 10 * 60; // 10 minutes
    this.maxAttempts = 5;
    this.blockDurationMinutes = 30;
  }

  /**
   * Update user verification status
   * @param {string} userId - User ID
   * @param {string} type - Verification type
   * @returns {Object} - Update result
   */
  async updateUserVerification(userId, type) {
    try {
      // Update user verification status based on type
      const updateData = {};
      
      switch (type) {
        case 'email':
          updateData.isEmailVerified = true;
          updateData.emailVerifiedAt = new Date();
          break;
        case 'phone':
          updateData.isPhoneVerified = true;
          updateData.phoneVerifiedAt = new Date();
          break;
        case 'twoFactor':
          updateData.isTwoFactorEnabled = true;
          updateData.twoFactorEnabledAt = new Date();
          break;
        default:
          throw new Error(`Invalid verification type: ${type}`);
      }
      
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Update user verification error:', error);
      throw error;
    }
  }

  /**
   * Generate a new OTP for the given contact
   * @param {Object} data - Contact and type information
   * @returns {Object} - OTP details
   */
  async generateOTP(data) {
    try {
      const { userId, phone, email, type = 'verification', deviceInfo } = data;

      if (!phone && !email) {
        throw new Error('Please provide phone or email');
      }

      // Generate OTP (6-digit number)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash OTP for storage
      const hashedOTP = this.hashOTP(otp);

      // Set expiration time
      const expiresAt = new Date(Date.now() + this.otpExpirySeconds * 1000);

      // Create OTP record in database
      const otpRecord = await OTP.create({
        userId,
        phone,
        email,
        otp: hashedOTP,
        type,
        expiresAt,
        maxAttempts: this.maxAttempts,
        deviceInfo,
      });

      // If Redis is enabled, store OTP in Redis for faster verification
      if (this.redisEnabled) {
        const redisKey = this.getRedisKey(phone, email, type);
        const redisValue = JSON.stringify({
          id: otpRecord._id.toString(),
          otp: hashedOTP,
          attempts: 0,
          maxAttempts: this.maxAttempts,
          isBlocked: false,
          isVerified: false,
        });

        await redisClient.set(redisKey, redisValue, this.otpExpirySeconds);
      }

      return {
        otpId: otpRecord._id,
        expiresAt,
        // Only include OTP in development mode
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      };
    } catch (error) {
      console.error('Generate OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify an OTP
   * @param {Object} data - Verification data
   * @returns {Object} - Verification result
   */
  async verifyOTP(data) {
    try {
      const { phone, email, otp, otpId, type = 'verification' } = data;

      if ((!phone && !email) || !otp) {
        throw new Error('Please provide phone/email and OTP');
      }

      let isValid = false;
      let otpRecord = null;
      
      // Try Redis first if enabled
      if (this.redisEnabled) {
        const redisKey = this.getRedisKey(phone, email, type);
        const redisData = await redisClient.get(redisKey);
        
        if (redisData) {
          const otpData = JSON.parse(redisData);
          
          // Check if OTP is blocked or already verified
          if (otpData.isBlocked) {
            throw new Error('Too many failed attempts. Please request a new OTP.');
          }
          
          if (otpData.isVerified) {
            throw new Error('OTP already verified');
          }
          
          // Verify OTP
          const hashedOTP = this.hashOTP(otp);
          isValid = hashedOTP === otpData.otp;
          
          if (!isValid) {
            // Increment attempts
            otpData.attempts += 1;
            
            // Block if max attempts reached
            if (otpData.attempts >= otpData.maxAttempts) {
              otpData.isBlocked = true;
              
              // Update Redis
              await redisClient.set(
                redisKey, 
                JSON.stringify(otpData),
                this.otpExpirySeconds
              );
              
              throw new Error('Too many failed attempts. Please request a new OTP.');
            }
            
            // Update Redis with new attempt count
            await redisClient.set(
              redisKey, 
              JSON.stringify(otpData),
              this.otpExpirySeconds
            );
            
            throw new Error(`Invalid OTP. ${otpData.maxAttempts - otpData.attempts} attempts remaining.`);
          }
          
          // Mark as verified in Redis
          otpData.isVerified = true;
          await redisClient.set(
            redisKey, 
            JSON.stringify(otpData),
            this.otpExpirySeconds
          );
          
          // Get OTP record from database to update
          otpRecord = await OTP.findById(otpData.id);
        }
      }
      
      // If not found in Redis or Redis is disabled, check database
      if (!otpRecord) {
        const query = {};
        if (otpId) query._id = otpId;
        if (email) query.email = email;
        if (phone) query.phone = phone;
        if (type) query.type = type;
        
        otpRecord = await OTP.findOne(query);
        
        if (!otpRecord) {
          throw new Error('Invalid OTP request');
        }
        
        // Check if OTP is expired
        if (otpRecord.expiresAt < new Date()) {
          throw new Error('OTP has expired');
        }
        
        // Check if OTP is blocked
        if (otpRecord.isBlocked) {
          throw new Error('Too many failed attempts. Please request a new OTP.');
        }
        
        // Check if OTP is already verified
        if (otpRecord.isVerified) {
          throw new Error('OTP already verified');
        }
        
        // Verify OTP
        const hashedOTP = this.hashOTP(otp);
        isValid = hashedOTP === otpRecord.otp;
        
        if (!isValid) {
          // Increment attempts
          otpRecord.attempts += 1;
          
          // Block if max attempts reached
          if (otpRecord.attempts >= otpRecord.maxAttempts) {
            otpRecord.isBlocked = true;
            otpRecord.blockedUntil = new Date(Date.now() + this.blockDurationMinutes * 60 * 1000);
            await otpRecord.save();
            
            throw new Error('Too many failed attempts. Please request a new OTP.');
          }
          
          await otpRecord.save();
          
          throw new Error(`Invalid OTP. ${otpRecord.maxAttempts - otpRecord.attempts} attempts remaining.`);
        }
      }
      
      // Mark OTP as verified in database
      otpRecord.isVerified = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();
      
      return {
        success: true,
        otpId: otpRecord._id,
        userId: otpRecord.userId,
        phone: otpRecord.phone,
        email: otpRecord.email,
        type: otpRecord.type,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  /**
   * Invalidate an OTP
   * @param {string} otpId - OTP ID
   * @returns {Object} - Invalidation result
   */
  async invalidateOTP(otpId) {
    try {
      const otpRecord = await OTP.findById(otpId);
      
      if (!otpRecord) {
        throw new Error('OTP not found');
      }
      
      // Mark as blocked
      otpRecord.isBlocked = true;
      otpRecord.blockedUntil = new Date(Date.now() + this.blockDurationMinutes * 60 * 1000);
      await otpRecord.save();
      
      // If Redis is enabled, invalidate in Redis too
      if (this.redisEnabled) {
        const redisKey = this.getRedisKey(otpRecord.phone, otpRecord.email, otpRecord.type);
        const redisData = await redisClient.get(redisKey);
        
        if (redisData) {
          const otpData = JSON.parse(redisData);
          otpData.isBlocked = true;
          
          await redisClient.set(
            redisKey, 
            JSON.stringify(otpData),
            this.otpExpirySeconds
          );
        }
      }
      
      return { success: true, message: 'OTP invalidated successfully' };
    } catch (error) {
      console.error('Invalidate OTP error:', error);
      throw error;
    }
  }

  /**
   * Hash OTP for secure storage
   * @param {string} otp - Plain OTP
   * @returns {string} - Hashed OTP
   */
  hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Generate Redis key for OTP
   * @param {string} phone - Phone number
   * @param {string} email - Email address
   * @param {string} type - OTP type
   * @returns {string} - Redis key
   */
  getRedisKey(phone, email, type) {
    const contact = phone || email;
    return `otp:${type}:${contact}`;
  }

  /**
   * Clean up expired OTPs
   * This method can be called periodically to clean up the database
   */
  async cleanupExpiredOTPs() {
    try {
      const result = await OTP.deleteMany({
        expiresAt: { $lt: new Date() },
        isVerified: false,
      });
      
      console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Cleanup expired OTPs error:', error);
      throw error;
    }
  }
  
  /**
   * Check if a user has verified their contact information
   * @param {string} userId - User ID
   * @param {string} verificationType - Type of verification to check (email, phone, twoFactor)
   * @returns {boolean} - Whether the user has verified the specified contact
   */
  async isUserVerified(userId, verificationType) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      switch (verificationType) {
        case 'email':
          return user.isEmailVerified === true;
        case 'phone':
          return user.isPhoneVerified === true;
        case 'twoFactor':
          return user.isTwoFactorEnabled === true;
        default:
          throw new Error(`Invalid verification type: ${verificationType}`);
      }
    } catch (error) {
      console.error('Check user verification error:', error);
      throw error;
    }
  }
  
  /**
   * Check if a user has reached the maximum OTP attempts
   * @param {string} phone - Phone number
   * @param {string} email - Email address
   * @param {string} type - OTP type
   * @returns {Object} - Status of OTP attempts
   */
  async checkOTPAttempts(phone, email, type = 'verification') {
    try {
      if (!phone && !email) {
        throw new Error('Please provide phone or email');
      }
      
      // Check Redis first if enabled
      if (this.redisEnabled) {
        const redisKey = this.getRedisKey(phone, email, type);
        const redisData = await redisClient.get(redisKey);
        
        if (redisData) {
          const otpData = JSON.parse(redisData);
          
          return {
            attempts: otpData.attempts,
            maxAttempts: otpData.maxAttempts,
            isBlocked: otpData.isBlocked,
            remainingAttempts: otpData.maxAttempts - otpData.attempts
          };
        }
      }
      
      // If not found in Redis, check database
      const query = {};
      if (email) query.email = email;
      if (phone) query.phone = phone;
      if (type) query.type = type;
      
      const otpRecord = await OTP.findOne(query).sort({ createdAt: -1 });
      
      if (!otpRecord) {
        return {
          attempts: 0,
          maxAttempts: this.maxAttempts,
          isBlocked: false,
          remainingAttempts: this.maxAttempts
        };
      }
      
      return {
        attempts: otpRecord.attempts,
        maxAttempts: otpRecord.maxAttempts,
        isBlocked: otpRecord.isBlocked,
        remainingAttempts: otpRecord.maxAttempts - otpRecord.attempts,
        blockedUntil: otpRecord.blockedUntil
      };
    } catch (error) {
      console.error('Check OTP attempts error:', error);
      throw error;
    }
  }
}

module.exports = new OTPService();