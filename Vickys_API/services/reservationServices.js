const Reservation = require("../models/Reservation.Model");
const generateId = require("../utils/generateId");
const emailSender = require("../utils/emailSender");

class ReservationManagement {
  async createReservation(payload) {
    console.log("guest:", payload.guests);

    try {
      const newId = await generateId();

      const newReservation = new Reservation({
        reservationId: newId,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        guestQuantity: payload.guests, // Changed from guestQuantity to match frontend
        request: payload.request,
        paymentMethod: payload.paymentMethod,
        roomName: payload.roomName, // Add room name from frontend
        totalAmount: payload.total, // Add total amount
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
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }

  async getReservation(id) {
    try {
        const reservation = await Reservation.findOne({reservationId:id}).exec();
        console.log(reservation);
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

        console.log(updatedReservation);
         return updatedReservation;
    } catch (error) {
      console.error("Error getting reservation:", error);
      throw error;
    }
  }
}

module.exports = new ReservationManagement();
