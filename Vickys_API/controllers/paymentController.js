const { log } = require("handlebars");
const PaymentServices = require("../services/paymentServices");
const tryAndCatch = require("../utils/tryAndCatch");

class PaymentController {
    // Create new payment
    createPayment = tryAndCatch(async (req, res) => {
        console.log('Received request to create payment:', req.body);
        const payload = req.body;
        console.log('Response:', payload);
        const { id } = req.params;    
        const response = await PaymentServices.createPayment(payload, id);
        return res.status(response.success ? 201 : 400).json(response);
    });

    // Get all payments
    getAllPayments = tryAndCatch(async (req, res) => {
        const response = await PaymentServices.getAllPayments();
        return res.status(200).json(response);
    });

    // Get payment by ID
    getPaymentById = tryAndCatch(async (req, res) => {
        const { id } = req.params;
        const response = await PaymentServices.getPaymentById(id);
        return res.status(response.success ? 200 : 404).json(response);
    });

    // Get payments by reservation
    getPaymentsByReservation = tryAndCatch(async (req, res) => {
        const { reservationId } = req.params;
        const response = await PaymentServices.getPaymentsByReservation(reservationId);
        return res.status(200).json(response);
    });

    // Update payment status
    updatePaymentStatus = tryAndCatch(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        const response = await PaymentServices.updatePaymentStatus(id, status);
        return res.status(response.success ? 200 : 404).json(response);
    });

    // Update payment details
    updatePayment = tryAndCatch(async (req, res) => {
        const { id } = req.params;
        const payload = req.body;
        const response = await PaymentServices.updatePayment(id, payload);
        return res.status(response.success ? 200 : 404).json(response);
    });

    // Delete payment
    deletePayment = tryAndCatch(async (req, res) => {
        const { id } = req.params;
        const response = await PaymentServices.deletePayment(id);
        return res.status(response.success ? 200 : 404).json(response);
    });

    // Get payment statistics
    getPaymentStats = tryAndCatch(async (req, res) => {
        const response = await PaymentServices.getPaymentStats();
        return res.status(200).json(response);
    });

    // Get payments by date range
    getPaymentsByDateRange = tryAndCatch(async (req, res) => {
        const { startDate, endDate } = req.query;
        const response = await PaymentServices.getPaymentsByDateRange(startDate, endDate);
        return res.status(200).json(response);
    });
}

module.exports = new PaymentController();