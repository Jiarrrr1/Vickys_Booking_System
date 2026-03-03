const adminServices = require('../services/adminServices')
const tryAndCatch = require('../utils/tryAndCatch')

class AdminController {
  // Create new admin
  createAdmin = tryAndCatch(async (req, res) => {
    const payload = req.body;
    const response = await adminServices.createAdmin(payload);
    return res.status(response.success ? 201 : 400).json(response);
  });

  // Admin login
  login = tryAndCatch(async (req, res) => {
    const payload = req.body;
    const response = await adminServices.login(payload);
    
    // Set token in cookie if login successful
    if (response.success && response.data?.token) {
      res.cookie('adminToken', response.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    return res.status(response.success ? 200 : 401).json(response);
  });

  // Verify token
  verifyToken = tryAndCatch(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    
    const response = await adminServices.verifyToken(token);
    return res.status(response.success ? 200 : 401).json(response);
  });

  // Change password
  changePassword = tryAndCatch(async (req, res) => {
    const adminId = req.admin?.id || req.params.id;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required"
      });
    }
    
    const response = await adminServices.changePassword(adminId, oldPassword, newPassword);
    return res.status(response.success ? 200 : 400).json(response);
  });

  // Get all admins
  getAllAdmins = tryAndCatch(async (req, res) => {
    const response = await adminServices.getAllAdmins();
    return res.status(response.success ? 200 : 400).json(response);
  });

  // Get admin by ID
  getAdminById = tryAndCatch(async (req, res) => {
    const { id } = req.params;
    const response = await adminServices.getAdminById(id);
    return res.status(response.success ? 200 : 404).json(response);
  });

  // Get current admin profile
  getCurrentAdmin = tryAndCatch(async (req, res) => {
    const adminId = req.admin?.id;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    
    const response = await adminServices.getAdminById(adminId);
    return res.status(response.success ? 200 : 404).json(response);
  });

  // Update admin
  updateAdmin = tryAndCatch(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    
    // Don't allow password update through this endpoint
    if (payload.password) {
      delete payload.password;
    }
    
    const response = await adminServices.updateAdmin(id, payload);
    return res.status(response.success ? 200 : 400).json(response);
  });

  // Update current admin profile
  updateCurrentAdmin = tryAndCatch(async (req, res) => {
    const adminId = req.admin?.id;
    const payload = req.body;
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    
    // Don't allow password update through this endpoint
    if (payload.password) {
      delete payload.password;
    }
    
    const response = await adminServices.updateAdmin(adminId, payload);
    return res.status(response.success ? 200 : 400).json(response);
  });

  // Delete admin
  deleteAdmin = tryAndCatch(async (req, res) => {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (req.admin?.id === id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }
    
    const response = await adminServices.deleteAdmin(id);
    return res.status(response.success ? 200 : 404).json(response);
  });

  // Logout
  logout = tryAndCatch(async (req, res) => {
    res.clearCookie('adminToken');
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  });
}

module.exports = new AdminController();