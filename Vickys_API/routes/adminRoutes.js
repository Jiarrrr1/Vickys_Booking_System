// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const AdminController = require("../controllers/adminController");

// Import middleware - make sure the path is correct
const { verifyAdminToken } = require('../middleware/authMiddleware');

// PUBLIC ROUTES (No auth required)
router.post('/createAdmin', AdminController.createAdmin);
router.post('/login', AdminController.login);
router.post('/logout', AdminController.logout);

// PROTECTED ROUTES (Auth required)
router.get('/verify', verifyAdminToken, AdminController.verifyToken);
router.get('/profile', verifyAdminToken, AdminController.getCurrentAdmin);
router.put('/profile', verifyAdminToken, AdminController.updateCurrentAdmin);
router.post('/change-password', verifyAdminToken, AdminController.changePassword);
router.get('/getAlladmins', verifyAdminToken, AdminController.getAllAdmins);
router.get('/getAdmin/:id', verifyAdminToken, AdminController.getAdminById);
router.put('/updateAdmins/:id', verifyAdminToken, AdminController.updateAdmin);
router.delete('/deleteAdmins/:id', verifyAdminToken, AdminController.deleteAdmin);


// In routes/adminRoutes.js

module.exports = router;