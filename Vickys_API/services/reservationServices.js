const Reservation = require("../models/Reservation.Model");
const generateId = require("../utils/generateId");
const emailSender = require("../utils/emailSender");

class ReservationServices {
  async createReservation(payload) {

    try {
      const newId = await generateId();

      const newReservation = new Reservation({
      reservationId: newId,
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      guestQuantity: payload.guests, // From frontend guests field
      request: payload.request || "",
      paymentMethod: payload.paymentMethod || "down", // Default or from frontend
      roomId: payload.roomId,
      roomName: payload.roomName,
      totalAmount: payload.total.toString(), // Convert to string as per schema
      status: payload.status || "Pending",
      // Add these if you want to store additional fields
      referenceNumber: payload.rfrncNumber,
      totalNights: payload.totalNights,
      downpayment: payload.downpayment,
      remainingBalance: payload.remainingBalance
      });

      await newReservation.save();

      // Send email
      try {
        await emailSender.sendReservationEmail(payload.email, newReservation);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      return {
        success: true,
        message: "Reservation Submitted Successfully. Confirmation email sent.",
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
      const response = await Reservation.find({});
      return response;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }

  async getReservation(id) {
    try {
        const reservation = await Reservation.findOne({reservationId:id}).exec();
         return reservation;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }

  async updateStatus(id, payload){
    try {
        
        const updatedReservation = await Reservation.findOneAndUpdate(
      { reservationId: id },
      {
        status: payload,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    updatedReservation.save();

        console.log('Updated Reservation:', updatedReservation.status);
         return updatedReservation;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }

  async updateNotes(id, payload){
    try {
        
        const updatedReservation = await Reservation.findOneAndUpdate(
      { reservationId: id },
      {
        notes: payload,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    updatedReservation.save();

        console.log('Updated Reservation:', updatedReservation.status);
         return updatedReservation;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }
}

module.exports = new ReservationServices();
