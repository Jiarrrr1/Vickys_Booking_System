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
    balance: {
        type:String,
        required: true,
        default: 0,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['GCash', 'Cash',],
        default: 'GCash'
    },
    referenceNumber: {
        type: String,
        default: "",
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
        default: 'Paid'
    },
    paymentDate: {
        type: String,
        default: getDateValue(),
    },
    notes: {
        type: String,
        default: "",
    },
     // Soft delete flag
    isDeleted: {
        type: Boolean,
        default: false,
        index: true  // For faster queries
    },
    deletedAt: {
        type: Date,
        default: null
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

paymentSchema.index({ isDeleted: 1, status: 1 });


function getDateValue() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
}

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;