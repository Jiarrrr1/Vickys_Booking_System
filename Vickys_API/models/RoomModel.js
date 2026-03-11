const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏨'
  },
  type: {
    type: String,
    enum: ['room', 'cottage'],
    default: 'room'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  description: {
    type: String,
    default: ''
  },
  capacity: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    type: String
  }],
  features: [{
    icon: String,
    label: String
  }],
  prices: [{
    amount: Number,
    label: String,
    small: Boolean
  }],
  img: {
    type: String,
    default: null
  },
  wide: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Add indexes for better query performance
roomSchema.index({ roomId: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Room', roomSchema)