const mongoose = require('mongoose');
const { notify } = require('../routes/reservationRoutes');

const reservationSchema = new mongoose.Schema({
    reservationId: {
        type: String, // Changed from Number to String for alphanumeric IDs
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String, // Changed from Number to String to preserve leading zeros
        required: true,
    },
    checkIn: {
        type: String,
        required: true,
    },
    checkOut: {
        type: String,
        required: true,
    },
    guestQuantity: {
        type: Number,
        required: true
    },
    request: {
        type: String,
        default: "",
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['down', 'full'], // Add validation for payment methods
        default: 'down'
    },
    roomId: {
        type: Number,
        required: true
    },
    roomName: {
        type: String,
        required: true
    },
    totalAmount: {
        type: String,
        required: true
    },
    // Additional fields from frontend
    referenceNumber: {
        type: String,
        default: ""
    },
    totalNights: {
        type: Number,
        default: 0
    },
    downpayment: {
        type: Number,
        default: 0
    },
    remainingBalance: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "Pending"
    },
    createdAt: {
        type: String,
        default: getDateValue(),
    },
    updatedAt: {
        type: String,
        default: getDateValue(),
    },
});

// Helper function for date
function getDateValue() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
}



const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;