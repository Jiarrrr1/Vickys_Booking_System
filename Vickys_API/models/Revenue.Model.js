const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
    revenueID:{
        type:Number,
        required: true,
        unique: true,
    },
    value: {
        type: Number,
        required: true, 
        trim: true,
    },
    month: {
        type: String,
        required: true,
        default:getMonthValue(),
    },
    year: {
        type:String,
        required: true,
        default:getYearValue(),
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

function getMonthValue() {
    const date = new Date();
    const month = date.toLocaleDateString("default", {month: "long"});

    let monthValue
    return (monthValue = `${month}`)
}


function getYearValue() {
    const date = new Date();
    const year = date.getFullYear();

    let yearValue
    return (yearValue = `${year}`)
}
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;