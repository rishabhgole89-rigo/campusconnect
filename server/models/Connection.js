const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false }
});

// Prevent duplicate connection documents
connectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });
connectionSchema.index({ receiver: 1, sender: 1 });
connectionSchema.index({ status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
