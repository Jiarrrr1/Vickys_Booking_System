const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
    feedBackId:{
        type:Number,
        required: true,
        unique: true,
    },
    from: {
        type: String,
        required: true, 
        trim: true,
    },
    rate: {
        type: Number,
        required: true,
    },
    comment: {
        type:String,
        required: true,
    },
    status: {
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

const Feedback = mongoose.model('Feedback', feedBackSchema);
module.exports = Feedback;