const adminServices = require('../services/adminServices');

const verifyAdminToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Verify token using your service
    const response = await adminServices.verifyToken(token);
    
    if (!response.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Attach admin data to request
    req.admin = response.data;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

module.exports = { verifyAdminToken };