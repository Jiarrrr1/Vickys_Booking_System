const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true,
    },
    reservationId: {
        type: String,
        required: true,
        ref: 'Reservation'
    },
    guestName: {
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
    roomName: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['GCash', 'Bank Transfer', 'Credit Card', 'Cash', 'Others'],
        default: 'GCash'
    },
    referenceNumber: {
        type: String,
        required: true,
    },
    paymentType: {
        type: String,
        required: true,
        enum: ['Downpayment', 'Full Payment', 'Balance Payment'],
        default: 'Downpayment'
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentDate: {
        type: String,
        default: getDateValue(),
    },
    notes: {
        type: String,
        default: "",
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

function getDateValue() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
}

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;