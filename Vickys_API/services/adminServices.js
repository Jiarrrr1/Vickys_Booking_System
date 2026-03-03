const Admin = require("../models/Admin.Model");
const generateId = require("../utils/generateId");
const bcrypt = require('bcryptjs'); // You'll need to install this
const jwt = require('jsonwebtoken'); // You'll need to install this

class AdminManagement {
  async createAdmin(payload) {
    try {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: payload.email });
      if (existingAdmin) {
        return {
          success: false,
          message: "Admin with this email already exists",
        };
      }

      const generatedId = await generateId();
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(payload.password, salt);

      const newAdmin = new Admin({
        userId: generatedId,
        fullName: payload.fullName,
        email: payload.email,
        password: hashedPassword, // Store hashed password
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

  async login(payload) {
    try {
      const { email, password } = payload;

      // Find admin by email
      const admin = await Admin.findOne({ email }).exec();

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

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin._id, 
          userId: admin.userId,
          email: admin.email,
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

  async getAllAdmins() {
    try {
      const admins = await Admin.find().select('-password');
      return {
        success: true,
        data: admins,
      };
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }
  }

  async getAdminById(id) {
    try {
      const admin = await Admin.findById(id);
      
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

  async updateAdmin(id, payload) {
    try {
      const admin = await Admin.findById(id);
      
      if (!admin) {
        return {
          success: false,
          message: "Admin not found",
        };
      }

      // Update fields
      if (payload.fullName) admin.fullName = payload.fullName;
      if (payload.email) {
        // Check if email is already taken by another admin
        const existingAdmin = await Admin.findOne({ 
          email: payload.email,
          _id: { $ne: id }
        });
        
        if (existingAdmin) {
          return {
            success: false,
            message: "Email already in use",
          };
        }
        admin.email = payload.email;
      }

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

  async deleteAdmin(id) {
    try {
      const admin = await Admin.findByIdAndDelete(id);
      
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