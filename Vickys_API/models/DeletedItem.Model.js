// ============================================
// BACKEND: DeletedItem Model
// ============================================
// File: models/DeletedItem.Model.js

const mongoose = require('mongoose');

const deletedItemSchema = new mongoose.Schema({
    // Reference to original item
    originalId: {
        type: String,  // The feedBackId, bookingId, etc.
        required: true
    },
    
    // Type of deleted item
    itemType: {
        type: String,
        enum: ['feedback', 'booking', 'payment', 'user', 'room'],
        required: true,
        index: true  // For faster queries
    },
    
    // Original data (full document snapshot)
    originalData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    
    // Who deleted it
    deletedBy: {
        type: String,  // Admin ID or name
        required: false
    },
    // When it was deleted
    deletedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // Auto-delete after X days (optional)
    expiresAt: {
        type: Date,
        required: false,
        index: true
    }
}, { 
    timestamps: true 
});

// Index for efficient querying
deletedItemSchema.index({ itemType: 1, deletedAt: -1 });
deletedItemSchema.index({ originalId: 1, itemType: 1 });


module.exports = mongoose.model('DeletedItem', deletedItemSchema);