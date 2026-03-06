const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
    feedBackId: {
        type: Number,
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
        min: 0,
        max: 5
    },
    comment: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['positive', 'neutral', 'negative'] // Optional: add enum for consistency
    },
    isDisplay: {  // This controls visibility on client site
        type: Boolean,
        default: false  // false = hidden, true = shown
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
})

feedBackSchema.index({ isDeleted: 1, status: 1 });


function getDateValue() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleDateString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
}

const Feedback = mongoose.model('Feedback', feedBackSchema);
module.exports = Feedback;