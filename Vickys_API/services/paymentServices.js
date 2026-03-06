const Payment = require('../models/Payment.Model');
const Reservation = require('../models/Reservation.Model');
const generateId = require("../utils/generateId");
const DeletedItemsService = require('../services/deletedItemsServices');  // ✅ ADD THIS

class PaymentManagement {
    // Create a new payment
  // Create a new payment
async createPayment(payload, id) {
    try {             
        const newId = await generateId();

        // Find the reservation to update its payment status
        const reservation = await Reservation.findOne({ 
            reservationId: id 
        });     

        if (!reservation) {
            throw new Error(`Reservation with ID ${id} not found`);
        }

        // Calculate new remaining balance
        const currentBalance = reservation.remainingBalance || 0;
        const paymentAmount = payload.amount || 0;
        const newBalance = Math.max(0, currentBalance - paymentAmount);

        const newPayment = new Payment({
            paymentId: newId,
            reservationId: reservation.reservationId,
            guestName: payload.guestName,
            email: payload.email,
            phoneNumber: payload.phoneNumber,
            roomName: payload.roomName,
            amount: paymentAmount,
            balance: newBalance, // Store the NEW balance after payment
            paymentMethod: payload.paymentMethod,
            referenceNumber: payload.referenceNumber || "",
            paymentType: payload.paymentType,
            status: 'Paid',
            notes: payload.notes || "",
        });

        await newPayment.save();
        console.log(`✅ Payment #${newId} created for reservation #${reservation.reservationId}`);

        // ALWAYS update the reservation's remaining balance
        const updateData = {
            remainingBalance: newBalance,
            updatedAt: getDateValue()
        };

        // If payment is successful and balance becomes 0, also update payment status
        if (newBalance === 0) {
            updateData.paymentStatus = 'Paid';
            console.log('💰 Payment completed - remaining balance is now 0');
        }

        await Reservation.findOneAndUpdate(
            { reservationId: reservation.reservationId },
            updateData,
            { new: true }
        );

        console.log(`✅ Reservation #${reservation.reservationId} balance updated to ₱${newBalance}`);

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
    // Get all payments (EXCLUDE deleted)  ✅ UPDATE THIS
    async getAllPayments() {
        try {
            const payments = await Payment
                .find({ isDeleted: { $ne: true } })  // ✅ Exclude soft-deleted
                .sort({ createdAt: -1 });
            
                
            return {
                success: true,
                data: payments
            };
        } catch (error) {
            console.error('Error getting payments:', error);
            throw error;
        }
    }

    // Get payment by ID (EXCLUDE deleted)  ✅ UPDATE THIS
    async getPaymentById(id) {
        try {
            const payment = await Payment.findOne({ 
                paymentId: id,
                isDeleted: { $ne: true }  // ✅ Exclude deleted
            }).exec();
            
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

    // Get payments by reservation ID (EXCLUDE deleted)  ✅ UPDATE THIS
    async getPaymentsByReservation(reservationId) {
        try {
            const payments = await Payment
                .find({ 
                    reservationId,
                    isDeleted: { $ne: true }  // ✅ Exclude deleted
                })
                .sort({ createdAt: -1 });
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
        console.log("fetched From Payment:", id, status);
        
        try {
            const updatedPayment = await Payment.findOneAndUpdate(
                { 
                    paymentId: id,
                    isDeleted: { $ne: true }  // ✅ Only update non-deleted
                },
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
                { 
                    paymentId: id,
                    isDeleted: { $ne: true }  // ✅ Only update non-deleted
                },
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

    // ✅ SOFT DELETE - Move to trash (SAME AS FEEDBACK)
    async deletePayment(id, deletedBy = null) {
        try {
            console.log(`Soft deleting payment: ${id}`);
            
            const result = await DeletedItemsService.moveToTrash(
                'payment',
                id,
                deletedBy
            );
            
            return result;
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    }

    // Get payment statistics (EXCLUDE deleted)  ✅ UPDATE THIS
    async getPaymentStats() {
        try {
            const payments = await Payment.find({ 
                isDeleted: { $ne: true }  // ✅ Exclude deleted
            });
            
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

    // Get payments by date range (EXCLUDE deleted)  ✅ UPDATE THIS
    async getPaymentsByDateRange(startDate, endDate) {
        try {
            const payments = await Payment.find({
                isDeleted: { $ne: true },  // ✅ Exclude deleted
                createdAt: { 
                    $gte: startDate,
                    $lte: endDate 
                }
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