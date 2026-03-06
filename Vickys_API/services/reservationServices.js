const Reservation = require("../models/Reservation.Model");
const generateId = require("../utils/generateId");
const emailSender = require("../utils/emailSender");
const DeletedItemsService = require('../services/deletedItemsServices');
const PaymentServices = require('./paymentServices');
const { checkAdmin } = require('../middleware/authMiddleware');

class ReservationServices {
  async createReservation(payload, req) {
    try {
      const newId = await generateId();

      const newReservation = new Reservation({
        reservationId: newId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        guestQuantity: payload.guests,
        request: payload.request || "",
        paymentType: payload.paymentType,
        paymentMethod: payload.paymentMethod || 'Gcash',
        roomId: payload.roomId,
        roomName: payload.roomName,
        totalAmount: payload.total.toString(),
        status: payload.status || "Pending",
        referenceNumber: payload.rfrncNumber || "",
        totalNights: payload.totalNights,
        downpayment: payload.downpayment,
        remainingBalance: payload.remainingBalance
      });

      await newReservation.save();
      console.log(`✅ Reservation #${newId} created successfully`);
      console.log(`   Total: ₱${payload.total}`);
      console.log(`   Downpayment: ₱${payload.downpayment}`);
      console.log(`   Remaining Balance: ₱${payload.remainingBalance}`);

      // Check if this is a client-side reservation (not admin)
      const isAdmin = await checkAdmin(req);
      
      if (!isAdmin) {
        console.log('👤 Client-side reservation - creating payment record...');
        
        // ✅ FIXED: Calculate amount to pay
        function calculateAmountToPay() {
          if (payload.paymentType === 'Downpayment') {
            return payload.downpayment;
          } else if (payload.paymentType === 'Full Payment') {
            return payload.total;
          } else if (payload.paymentType === 'Balance Payment') {
            return payload.remainingBalance;
          }
          return 0;
        }

        function generateNotes() {
          if (payload.paymentType === 'Downpayment') {
            return `Downpayment for Reservation #${newReservation.reservationId} received. Remaining balance: ₱${newReservation.remainingBalance || 0}`;
          } else if (payload.paymentType === 'Full Payment') {
            return `Full payment for Reservation #${newReservation.reservationId} received.`;
          } else if (payload.paymentType === 'Balance Payment') {
            return `Balance payment for Reservation #${newReservation.reservationId} received.`;
          }
          return '';
        }

        const amountPaid = calculateAmountToPay();
        
        // ✅ FIXED: Calculate the balance AFTER this payment
        const balanceAfterPayment = payload.total - amountPaid;

        const paymentPayload = {
          guestName: newReservation.fullName,
          email: newReservation.email,
          phoneNumber: newReservation.phoneNumber,
          roomName: newReservation.roomName,
          amount: amountPaid,  // Amount being paid NOW
          paymentMethod: payload.paymentMethod === 'gcash' ? 'Gcash' : 'Cash',
          referenceNumber: payload.paymentMethod === 'gcash' ? payload.rfrncNumber : '',
          paymentType: payload.paymentType,
          notes: generateNotes(),
          balance: balanceAfterPayment  // ✅ FIXED: Balance AFTER this payment
        };

        console.log("💰 Payment payload:");
        console.log(`   Amount Paid: ₱${amountPaid}`);
        console.log(`   Balance After Payment: ₱${balanceAfterPayment}`);

        await PaymentServices.createPayment(paymentPayload, newReservation.reservationId);
        console.log('✅ Payment record created successfully');
      } else {
        console.log('👤 Admin-side reservation - no automatic payment record created');
        console.log('   Admin should manually create payment records if needed');
      }

      if (payload.status === 'Pending') {
        // Send email (non-blocking)
        setTimeout(async () => {
          try {
            await emailSender.sendReservationEmail(payload.email, newReservation);
            console.log(`📧 Email sent for #${newReservation.reservationId}`);
          } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
          }
        }, 100);
      } 

      return {
        success: true,
        message: "Reservation Submitted Successfully.",
        data: newReservation,
        reservationId: newId,
      };
      
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  }

  async getAllReservations() {
    try {
      const response = await Reservation.find({ 
        isDeleted: { $ne: true }
      }).sort({ createdAt: -1 });
      return response;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }

  async getReservation(id) {
    try {
      const reservation = await Reservation.findOne({
        reservationId: id,
        isDeleted: { $ne: true }
      }).exec();
      return reservation;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }

  async updateStatus(id, payload) {
    try {
      const updatedReservation = await Reservation.findOneAndUpdate(
        { 
          reservationId: id,
          isDeleted: { $ne: true }
        },
        { status: payload },
        { new: true, runValidators: true }
      );

      if (payload === 'Confirmed'){
        setTimeout(async () => {
          try {
            await emailSender.sendConfirmationEmail(updatedReservation.email, updatedReservation);
            console.log(`📧 Confirmation email sent for #${updatedReservation.reservationId}`);
          } catch (emailError) {
            console.error("Confirmation email sending failed:", emailError.message);
          }
        }, 100);
      }

      if (updatedReservation) {
        await updatedReservation.save();
        console.log('✅ Updated Reservation status:', updatedReservation.status);
      }
      
      return updatedReservation;
    } catch (error) {
      console.error("Error updating reservation:", error);
      throw error;
    }
  }

  async updateNotes(id, payload) {
    try {
      const updatedReservation = await Reservation.findOneAndUpdate(
        { 
          reservationId: id,
          isDeleted: { $ne: true }
        },
        { notes: payload },
        { new: true, runValidators: true }
      );

      if (updatedReservation) {
        await updatedReservation.save();
        console.log('✅ Updated Reservation notes');
      }
      
      return updatedReservation;
    } catch (error) {
      console.error("Error updating reservation:", error);
      throw error;
    }
  }

  async deleteReservation(id, deletedBy = null) {
    try {
      console.log(`🗑️ Soft deleting booking: ${id}`);
      
      const result = await DeletedItemsService.moveToTrash(
        'booking',
        id,
        deletedBy
      );
      
      return result;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }
}

module.exports = new ReservationServices();