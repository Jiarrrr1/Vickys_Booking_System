const Admin = require("../models/Admin.Model");
const generateId = require("../utils/generateId");

class AdminManagement {
  async createAdmin(payload) {
    const generatedId = await generateId();

    try {
      const newAdmin = new Admin({
        userId: generatedId,
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
      });

      await newAdmin.save();

      return {
        success: true,
        message: "Admin Created",
        data: newAdmin,
      };
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  }

  async login(payload) {
    try {
      const user = await Admin.findOne({ email: payload.email }).exec();

      if (user) {
        return {
          success: true,
          message: "Logged In.",
          data: user,
        };
      }
    } catch (error) {
        console.error("Error logging in:", error);
      throw error;
    }
  }
}

module.exports = new AdminManagement();
