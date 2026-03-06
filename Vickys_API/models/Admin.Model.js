const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
   userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive',],
        default: 'active',
        index: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: getDateValue(),
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: getDateValue()
    }
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