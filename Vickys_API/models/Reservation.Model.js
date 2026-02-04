const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationId:{
        type:Number,
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
        type:Number,
        required: true,
    },
    checkIn: {
        type:String,
        required: true,
    },
    checkOut: {
        type: String,
        required:true,
    },
    guestQuantity: {
        type: Number,
        required: true
    },
    request: {
        type: String,
        default: "",
    },
    paymentMethod:{
        type:String,
        required:true
    },
    roomName: {
        type: String,
        required: true
    },
    totalAmount: {
        type: String,
        required: true
    },
    status: {
        type:String,
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
})

function getDateValue() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString("default", {month: "long"});
    const year = date.getFullYear()

    let finalDate;

    return (finalDate = `${month} ${day} ${year}`)
}

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;