// reservationModel.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationId: {
        type: String,
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
        type: String,
        required: true,
    },
    bookingDate: {
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
    // Change this to store both payment type and method
    paymentType: {
        type: String,
        required: true,
        enum: ['Downpayment', 'Full Payment', 'Balance Payment'],
        default: 'Down'
    },
    paymentMethod: { 
        type: String,
        required: true,
        enum: ['GCash', 'Cash'],
        default: 'Gcash'
    },
    roomId: {
        type: String,
        required: true
    },
    roomName: {
        type: String,
        required: true
    },
    roomQuantity:{
        type: Number,
        default: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
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
        default: "Confirmed",

    },
    reservationType: {
        type: String,
        enum: ['Day Time', 'Night Time', 'Full Day'],
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
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