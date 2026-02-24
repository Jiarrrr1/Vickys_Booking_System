const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userId:{
        type:Number,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true, 
        trim: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type:String,
        required: true,
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

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;