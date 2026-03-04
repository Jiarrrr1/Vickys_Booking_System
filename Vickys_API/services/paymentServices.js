const Payment = require('../models/Payment.Model');
const Reservation = require('../models/Reservation.Model');
const generateId = require("../utils/generateId");

class PaymentManagement {
    // Create a new payment
    async createPayment(payload, id) {
        try {
            console.log('Creating payment:', payload);
            
            const newId = await generateId();

            // Find the reservation to update its payment status
            const reservation = await Reservation.findOne({ 
                reservationId: id 
            });

            console.log('Found reservation:', reservation);
            

            const newPayment = new Payment({
                paymentId: newId,
                reservationId: reservation.reservationId,
                guestName: payload.guestName,
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                roomName: payload.roomName,
                amount: payload.amount,
                paymentMethod: payload.paymentMethod || 'GCash',
                referenceNumber: payload.referenceNumber,
                paymentType: payload.paymentType || 'Downpayment',
                status: payload.status || 'Pending',
                notes: payload.notes || '',
            });

            await newPayment.save();

            // If payment is successful, update reservation status
            if (payload.status === 'Paid') {
                await Reservation.findOneAndUpdate(
                    { reservationId: payload.reservationId },
                    { 
                        paymentStatus: 'Paid',
                        updatedAt: getDateValue()
                    }
                );
            }

            return {
                success: true,
                message: "Payment recorded successfully",
                data: newPayment,
            };
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    // Get all payments
    async getAllPayments() {
        try {
            const payments = await Payment.find({}).sort({ createdAt: -1 });
            return {
                success: true,
                data: payments
            };
        } catch (error) {
            console.error('Error getting payments:', error);
            throw error;
        }
    }

    // Get payment by ID
    async getPaymentById(id) {
        try {
            const payment = await Payment.findOne({ paymentId: id }).exec();
            
            if (!payment) {
                return {
                    success: false,
                    message: "Payment not found"
                };
            }

            return {
                success: true,
                data: payment
            };
        } catch (error) {
            console.error('Error getting payment:', error);
            throw error;
        }
    }

    // Get payments by reservation ID
    async getPaymentsByReservation(reservationId) {
        try {
            const payments = await Payment.find({ reservationId }).sort({ createdAt: -1 });
            return {
                success: true,
                data: payments
            };
        } catch (error) {
            console.error('Error getting payments by reservation:', error);
            throw error;
        }
    }

    // Update payment status
    async updatePaymentStatus(id, status) {
        try {
            const updatedPayment = await Payment.findOneAndUpdate(
                { paymentId: id },
                { 
                    status: status,
                    updatedAt: getDateValue()
                },
                { new: true, runValidators: true }
            );

            if (!updatedPayment) {
                return {
                    success: false,
                    message: "Payment not found"
                };
            }

            // If payment is marked as paid, update the reservation
            if (status === 'Paid') {
                await Reservation.findOneAndUpdate(
                    { reservationId: updatedPayment.reservationId },
                    { 
                        paymentStatus: 'Paid',
                        updatedAt: getDateValue()
                    }
                );
            }

            return {
                success: true,
                message: "Payment status updated successfully",
                data: updatedPayment
            };
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    // Update payment details
    async updatePayment(id, payload) {
        try {
            const updatedPayment = await Payment.findOneAndUpdate(
                { paymentId: id },
                {
                    amount: payload.amount,
                    paymentMethod: payload.paymentMethod,
                    referenceNumber: payload.referenceNumber,
                    paymentType: payload.paymentType,
                    notes: payload.notes,
                    updatedAt: getDateValue()
                },
                { new: true, runValidators: true }
            );

            if (!updatedPayment) {
                return {
                    success: false,
                    message: "Payment not found"
                };
            }

            return {
                success: true,
                message: "Payment updated successfully",
                data: updatedPayment
            };
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    }

    // Delete payment
    async deletePayment(id) {
        try {
            const deletedPayment = await Payment.findOneAndDelete({ paymentId: id });

            if (!deletedPayment) {
                return {
                    success: false,
                    message: "Payment not found"
                };
            }

            return {
                success: true,
                message: "Payment deleted successfully"
            };
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    }

    // Get payment statistics
    async getPaymentStats() {
        try {
            const payments = await Payment.find({});
            
            const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const paidCount = payments.filter(p => p.status === 'Paid').length;
            const pendingCount = payments.filter(p => p.status === 'Pending').length;
            
            // Group by payment method
            const byMethod = {};
            payments.forEach(p => {
                byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + p.amount;
            });

            // Group by month
            const byMonth = {};
            payments.forEach(p => {
                const month = p.paymentDate.split(' ')[0]; // Get month name
                byMonth[month] = (byMonth[month] || 0) + p.amount;
            });

            return {
                success: true,
                data: {
                    totalRevenue,
                    totalTransactions: payments.length,
                    paidCount,
                    pendingCount,
                    averagePerTransaction: payments.length ? totalRevenue / payments.length : 0,
                    byMethod,
                    byMonth
                }
            };
        } catch (error) {
            console.error('Error getting payment stats:', error);
            throw error;
        }
    }

    // Get payments by date range
    async getPaymentsByDateRange(startDate, endDate) {
        try {
            // This is a simple implementation - adjust based on your date format
            const payments = await Payment.find({
                $and: [
                    { createdAt: { $gte: startDate } },
                    { createdAt: { $lte: endDate } }
                ]
            }).sort({ createdAt: -1 });

            return {
                success: true,
                data: payments
            };
        } catch (error) {
            console.error('Error getting payments by date range:', error);
            throw error;
        }
    }
}

function getDateValue() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
}

module.exports = new PaymentManagement();