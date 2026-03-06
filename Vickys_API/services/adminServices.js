const Admin = require("../models/Admin.Model");
const generateId = require("../utils/generateId");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminManagement {
  // ==========================================
  // CREATE ADMIN
  // ==========================================
  async createAdmin(payload) {
    try {
      // Check if admin already exists by email or username
      const existingAdmin = await Admin.findOne({ 
        $or: [
          { email: payload.email.toLowerCase() },
          { userName: payload.userName.toLowerCase() }
        ]
      });
      
      if (existingAdmin) {
        return {
          success: false,
          message: "Admin with this email or username already exists",
        };
      }

      const generatedId = await generateId();
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(payload.password, salt);

      const newAdmin = new Admin({
        userId: generatedId,
        fullName: payload.fullName,
        userName: payload.userName.toLowerCase(),
        status: payload.status || 'Active', // Use lowercase to match enum
        lastLogin: null,
        email: payload.email.toLowerCase(),
        password: hashedPassword,
      });

      await newAdmin.save();

      // Don't send password back
      const adminData = newAdmin.toObject();
      delete adminData.password;

      return {
        success: true,
        message: "Admin created successfully",
        data: adminData,
      };
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================
  async login(payload) {
    try {
      const { email, password } = payload;

      // Find admin by email
      const admin = await Admin.findOne({ email:email }).exec();

      if (!admin) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // ✅ Update lastLogin and status - Use lowercase 'active' to match enum
      admin.lastLogin = new Date();
      admin.status = 'Active';  // MUST be lowercase to match enum
      await admin.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin._id, 
          userId: admin.userId,
          email: admin.email,
          userName: admin.userName,
          role: 'admin' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Don't send password back
      const adminData = admin.toObject();
      delete adminData.password;

      return {
        success: true,
        message: "Login successful",
        data: {
          admin: adminData,
          token
        },
      };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  // ==========================================
  // VERIFY TOKEN
  // ==========================================
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return {
          success: false,
          message: "Admin not found",
        };
      }

      return {
        success: true,
        data: admin,
      };
    } catch (error) {
      return {
        success: false,
        message: "Invalid token",
      };
    }
  }

  // ==========================================
  // VERIFY PASSWORD (for sensitive operations)
  // ==========================================
 async verifyPassword(userId, password) {
  try {
    console.log('🔐 Verifying password for userId:', userId);
    
    // Find by userId field (not _id)
    const admin = await Admin.findOne({ _id: userId });
    console.log('   Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      return false;
    }
    // const isValid = true
    const isValid = await bcrypt.compare(password, admin.password);
    console.log('   Password valid:', isValid);
    return isValid;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  async changePassword(adminId, oldPassword, newPassword) {
    try {
      const admin = await Admin.findById(adminId);

      if (!admin) {
        return {
          success: false,
          message: "Admin not found",
        };
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, admin.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      admin.password = hashedPassword;
      await admin.save();

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // ==========================================
  // GET ALL ADMINS
  // ==========================================
  async getAllAdmins() {
    try {
      const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
      
      // Transform to match frontend expected format
      const formattedAdmins = admins.map(admin => ({
        id: admin._id,
        userId: admin.userId,
        fullName: admin.fullName,
        username: admin.userName,
        email: admin.email,
        status: admin.status,
        role: admin.status === 'active' ? 'admin' : 'inactive',
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }));

      return {
        success: true,
        data: formattedAdmins,
      };
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }
  }

  // ==========================================
  // GET ADMIN BY ID
  // ==========================================
  async getAdminById(id) {
    try {
      const admin = await Admin.findById(id).select('-password');
      
      if (!admin) {
        return {
          success: false,
          message: "Admin not found",
        };
      }

      return {
        success: true,
        data: admin,
      };
    } catch (error) {
      console.error("Error fetching admin:", error);
      throw error;
    }
  }

  // ==========================================
  // UPDATE ADMIN
  // ==========================================
 async updateAdmin(userId, payload) {
  try {
    // Find by userId field (not _id)
    const admin = await Admin.findOne({ userId: userId });
    
    if (!admin) {
      return {
        success: false,
        message: "Admin not found",
      };
    }

    // Check if email is already taken by another admin
    if (payload.email && payload.email !== admin.email) {
      const existingAdmin = await Admin.findOne({ 
        email: payload.email.toLowerCase(),
        userId: { $ne: userId } // Use userId instead of _id
      });
      
      if (existingAdmin) {
        return {
          success: false,
          message: "Email already in use",
        };
      }
      admin.email = payload.email.toLowerCase();
    }

    // Update fields
    if (payload.fullName) admin.fullName = payload.fullName;
    if (payload.status) admin.status = payload.status; // Keep case as sent

    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    return {
      success: true,
      message: "Admin updated successfully",
      data: adminData,
    };
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
}
  // ==========================================
  // DELETE ADMIN
  // ==========================================
  async deleteAdmin(userId) {
  try {
    const admin = await Admin.findOneAndDelete({ userId: userId });
    
    if (!admin) {
      return {
        success: false,
        message: "Admin not found",
      };
    }

    return {
      success: true,
      message: "Admin deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
}
}

module.exports = new AdminManagement();