const Reservation = require("../models/Reservation.Model");
const Payment = require("../models/Payment.Model");
const DeletedItemsService = require('../services/deletedItemsServices');
const PaymentServices = require('./paymentServices');

class RevenueServices {
    async getAllPaymentsForAdmin() {
        try {
            const response = await Payment.find();
            return response;
        } catch (error) {
            console.error('Error getting payments for admin:', error);
            throw error;
        }
    }
}

module.exports = new RevenueServices();