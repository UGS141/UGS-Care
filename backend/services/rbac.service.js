const { Role } = require('../models/security.model');
const User = require('../models/user.model');

/**
 * Service for managing role-based access control (RBAC)
 */
class RBACService {
  /**
   * Get all available roles
   * @param {Object} options - Query options
   * @returns {Array} - List of roles
   */
  async getRoles(options = {}) {
    try {
      const { isActive = true, isSystem, includePermissions = true } = options;
      
      const query = {};
      if (typeof isActive === 'boolean') query.isActive = isActive;
      if (typeof isSystem === 'boolean') query.isSystem = isSystem;
      
      const projection = includePermissions ? {} : { permissions: 0 };
      
      const roles = await Role.find(query, projection).sort({ name: 1 });
      return roles;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  }

  /**
   * Get a role by ID
   * @param {string} roleId - Role ID
   * @returns {Object} - Role details
   */
  async getRoleById(roleId) {
    try {
      const role = await Role.findById(roleId);
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      return role;
    } catch (error) {
      console.error('Get role by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @param {string} createdBy - User ID of creator
   * @returns {Object} - Created role
   */
  async createRole(roleData, createdBy) {
    try {
      // Check if role with same name already exists
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (existingRole) {
        throw new Error(`Role with name '${roleData.name}' already exists`);
      }
      
      // Create new role
      const role = await Role.create({
        ...roleData,
        isSystem: false, // Only system can create system roles
        createdBy,
        updatedBy: createdBy,
      });
      
      return role;
    } catch (error) {
      console.error('Create role error:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   * @param {string} roleId - Role ID
   * @param {Object} roleData - Updated role data
   * @param {string} updatedBy - User ID of updater
   * @returns {Object} - Updated role
   */
  async updateRole(roleId, roleData, updatedBy) {
    try {
      const role = await Role.findById(roleId);
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      // Prevent updating system roles
      if (role.isSystem) {
        throw new Error('System roles cannot be modified');
      }
      
      // Check if name is being changed and if it already exists
      if (roleData.name && roleData.name !== role.name) {
        const existingRole = await Role.findOne({ name: roleData.name });
        
        if (existingRole) {
          throw new Error(`Role with name '${roleData.name}' already exists`);
        }
      }
      
      // Update role
      Object.assign(role, {
        ...roleData,
        isSystem: role.isSystem, // Preserve system flag
        updatedBy,
        updatedAt: Date.now(),
      });
      
      await role.save();
      
      return role;
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   * @param {string} roleId - Role ID
   * @returns {Object} - Deletion result
   */
  async deleteRole(roleId) {
    try {
      const role = await Role.findById(roleId);
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      // Prevent deleting system roles
      if (role.isSystem) {
        throw new Error('System roles cannot be deleted');
      }
      
      // Check if any users are using this role
      const usersWithRole = await User.countDocuments({ role: role.name });
      
      if (usersWithRole > 0) {
        throw new Error(`Cannot delete role '${role.name}' as it is assigned to ${usersWithRole} users`);
      }
      
      // Delete role
      await role.deleteOne();
      
      return { success: true, message: `Role '${role.name}' deleted successfully` };
    } catch (error) {
      console.error('Delete role error:', error);
      throw error;
    }
  }

  /**
   * Check if a user has a specific permission
   * @param {string} userId - User ID
   * @param {string} permission - Permission to check
   * @returns {boolean} - Whether user has permission
   */
  async hasPermission(userId, permission) {
    try {
      // Get user with role
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        return false;
      }
      
      // Get role
      const role = await Role.findOne({ name: user.role });
      
      if (!role) {
        return false;
      }
      
      // Check if role is active
      if (!role.isActive) {
        return false;
      }
      
      // Check if role has permission
      return role.permissions.includes(permission);
    } catch (error) {
      console.error('Has permission error:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user
   * @param {string} userId - User ID
   * @returns {Array} - List of permissions
   */
  async getUserPermissions(userId) {
    try {
      // Get user with role
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        return [];
      }
      
      // Get role
      const role = await Role.findOne({ name: user.role });
      
      if (!role || !role.isActive) {
        return [];
      }
      
      return role.permissions;
    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }

  /**
   * Initialize default roles
   * This method should be called during application startup
   */
  async initializeDefaultRoles() {
    try {
      const defaultRoles = [
        {
          name: 'admin',
          description: 'System administrator with full access',
          permissions: ['*'], // Wildcard for all permissions
          isSystem: true,
          isActive: true,
        },
        {
          name: 'patient',
          description: 'Regular patient user',
          permissions: [
            'profile:read',
            'profile:update',
            'appointment:create',
            'appointment:read',
            'appointment:update',
            'appointment:cancel',
            'prescription:read',
            'medical_record:read',
            'request:create',
            'request:read',
            'request:update',
            'payment:create',
            'payment:read',
            'review:create',
            'review:read',
            'review:update',
            'review:delete',
          ],
          isSystem: true,
          isActive: true,
        },
        {
          name: 'doctor',
          description: 'Healthcare provider',
          permissions: [
            'profile:read',
            'profile:update',
            'appointment:read',
            'appointment:update',
            'appointment:cancel',
            'prescription:create',
            'prescription:read',
            'prescription:update',
            'medical_record:create',
            'medical_record:read',
            'medical_record:update',
            'patient:read',
            'schedule:create',
            'schedule:read',
            'schedule:update',
            'schedule:delete',
          ],
          isSystem: true,
          isActive: true,
        },
        {
          name: 'pharmacy',
          description: 'Pharmacy staff',
          permissions: [
            'profile:read',
            'profile:update',
            'prescription:read',
            'prescription:update',
            'inventory:create',
            'inventory:read',
            'inventory:update',
            'inventory:delete',
            'order:create',
            'order:read',
            'order:update',
            'order:cancel',
          ],
          isSystem: true,
          isActive: true,
        },
        {
          name: 'hospital',
          description: 'Hospital administrator',
          permissions: [
            'profile:read',
            'profile:update',
            'doctor:create',
            'doctor:read',
            'doctor:update',
            'doctor:delete',
            'department:create',
            'department:read',
            'department:update',
            'department:delete',
            'facility:create',
            'facility:read',
            'facility:update',
            'facility:delete',
            'appointment:read',
            'medical_record:read',
          ],
          isSystem: true,
          isActive: true,
        },
      ];

      // Create or update default roles
      for (const roleData of defaultRoles) {
        const existingRole = await Role.findOne({ name: roleData.name });
        
        if (existingRole) {
          // Update existing role
          Object.assign(existingRole, {
            description: roleData.description,
            permissions: roleData.permissions,
            isSystem: true,
            isActive: true,
            updatedAt: Date.now(),
          });
          
          await existingRole.save();
          console.log(`Updated default role: ${roleData.name}`);
        } else {
          // Create new role
          await Role.create(roleData);
          console.log(`Created default role: ${roleData.name}`);
        }
      }
      
      return { success: true, message: 'Default roles initialized successfully' };
    } catch (error) {
      console.error('Initialize default roles error:', error);
      throw error;
    }
  }

  /**
   * Get all available permissions in the system
   * This is a static list of all possible permissions
   * @returns {Array} - List of permission objects
   */
  getAvailablePermissions() {
    // Group permissions by resource
    return [
      // User and profile permissions
      { value: 'profile:read', label: 'View profile', group: 'Profile' },
      { value: 'profile:update', label: 'Update profile', group: 'Profile' },
      
      // Patient permissions
      { value: 'patient:read', label: 'View patient data', group: 'Patient' },
      { value: 'patient:update', label: 'Update patient data', group: 'Patient' },
      
      // Doctor permissions
      { value: 'doctor:create', label: 'Create doctor profile', group: 'Doctor' },
      { value: 'doctor:read', label: 'View doctor profile', group: 'Doctor' },
      { value: 'doctor:update', label: 'Update doctor profile', group: 'Doctor' },
      { value: 'doctor:delete', label: 'Delete doctor profile', group: 'Doctor' },
      
      // Appointment permissions
      { value: 'appointment:create', label: 'Create appointment', group: 'Appointment' },
      { value: 'appointment:read', label: 'View appointment', group: 'Appointment' },
      { value: 'appointment:update', label: 'Update appointment', group: 'Appointment' },
      { value: 'appointment:cancel', label: 'Cancel appointment', group: 'Appointment' },
      
      // Prescription permissions
      { value: 'prescription:create', label: 'Create prescription', group: 'Prescription' },
      { value: 'prescription:read', label: 'View prescription', group: 'Prescription' },
      { value: 'prescription:update', label: 'Update prescription', group: 'Prescription' },
      
      // Medical record permissions
      { value: 'medical_record:create', label: 'Create medical record', group: 'Medical Record' },
      { value: 'medical_record:read', label: 'View medical record', group: 'Medical Record' },
      { value: 'medical_record:update', label: 'Update medical record', group: 'Medical Record' },
      
      // Request permissions
      { value: 'request:create', label: 'Create request', group: 'Request' },
      { value: 'request:read', label: 'View request', group: 'Request' },
      { value: 'request:update', label: 'Update request', group: 'Request' },
      
      // Payment permissions
      { value: 'payment:create', label: 'Create payment', group: 'Payment' },
      { value: 'payment:read', label: 'View payment', group: 'Payment' },
      { value: 'payment:refund', label: 'Refund payment', group: 'Payment' },
      
      // Review permissions
      { value: 'review:create', label: 'Create review', group: 'Review' },
      { value: 'review:read', label: 'View review', group: 'Review' },
      { value: 'review:update', label: 'Update review', group: 'Review' },
      { value: 'review:delete', label: 'Delete review', group: 'Review' },
      
      // Inventory permissions
      { value: 'inventory:create', label: 'Create inventory item', group: 'Inventory' },
      { value: 'inventory:read', label: 'View inventory', group: 'Inventory' },
      { value: 'inventory:update', label: 'Update inventory', group: 'Inventory' },
      { value: 'inventory:delete', label: 'Delete inventory item', group: 'Inventory' },
      
      // Order permissions
      { value: 'order:create', label: 'Create order', group: 'Order' },
      { value: 'order:read', label: 'View order', group: 'Order' },
      { value: 'order:update', label: 'Update order', group: 'Order' },
      { value: 'order:cancel', label: 'Cancel order', group: 'Order' },
      
      // Schedule permissions
      { value: 'schedule:create', label: 'Create schedule', group: 'Schedule' },
      { value: 'schedule:read', label: 'View schedule', group: 'Schedule' },
      { value: 'schedule:update', label: 'Update schedule', group: 'Schedule' },
      { value: 'schedule:delete', label: 'Delete schedule', group: 'Schedule' },
      
      // Department permissions
      { value: 'department:create', label: 'Create department', group: 'Department' },
      { value: 'department:read', label: 'View department', group: 'Department' },
      { value: 'department:update', label: 'Update department', group: 'Department' },
      { value: 'department:delete', label: 'Delete department', group: 'Department' },
      
      // Facility permissions
      { value: 'facility:create', label: 'Create facility', group: 'Facility' },
      { value: 'facility:read', label: 'View facility', group: 'Facility' },
      { value: 'facility:update', label: 'Update facility', group: 'Facility' },
      { value: 'facility:delete', label: 'Delete facility', group: 'Facility' },
      
      // Admin permissions
      { value: 'user:create', label: 'Create user', group: 'Admin' },
      { value: 'user:read', label: 'View user', group: 'Admin' },
      { value: 'user:update', label: 'Update user', group: 'Admin' },
      { value: 'user:delete', label: 'Delete user', group: 'Admin' },
      { value: 'role:create', label: 'Create role', group: 'Admin' },
      { value: 'role:read', label: 'View role', group: 'Admin' },
      { value: 'role:update', label: 'Update role', group: 'Admin' },
      { value: 'role:delete', label: 'Delete role', group: 'Admin' },
      { value: 'settings:read', label: 'View settings', group: 'Admin' },
      { value: 'settings:update', label: 'Update settings', group: 'Admin' },
      
      // Special permissions
      { value: '*', label: 'All permissions (admin only)', group: 'Special' },
    ];
  }
}

module.exports = new RBACService();