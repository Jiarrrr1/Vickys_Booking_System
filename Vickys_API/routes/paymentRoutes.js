const PaymentController = require("../controllers/paymentController");
const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public routes (if needed)
// router.post('/createPayment', PaymentController.createPayment);

// Protected routes (require admin auth)
router.get('/getAllPayments', verifyAdminToken, PaymentController.getAllPayments);
router.get('/getPayment/:id', verifyAdminToken, PaymentController.getPaymentById);
router.get('/getPaymentsByReservation/:reservationId', verifyAdminToken, PaymentController.getPaymentsByReservation);
router.get('/getPaymentStats', verifyAdminToken, PaymentController.getPaymentStats);
router.get('/getPaymentsByDateRange', verifyAdminToken, PaymentController.getPaymentsByDateRange);

router.post('/createPayment/:id', verifyAdminToken, PaymentController.createPayment);
router.patch('/updatePaymentStatus/:id', verifyAdminToken, PaymentController.updatePaymentStatus);
router.put('/updatePayment/:id', verifyAdminToken, PaymentController.updatePayment);
router.delete('/deletePayment/:id', verifyAdminToken, PaymentController.deletePayment);

module.exports = router;