const AdminController = require("../controllers/adminController")

const express = require('express');
const router = express.Router();

router.post('/createAdmin', AdminController.createAdmin);




module.exports = router