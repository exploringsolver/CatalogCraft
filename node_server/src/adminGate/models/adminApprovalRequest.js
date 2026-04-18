const mongoose = require('mongoose');

const adminApprovalRequestSchema = new mongoose.Schema(
  {
    requesterEmail: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DENIED'],
      default: 'PENDING',
      index: true,
    },
    approveTokenHash: { type: String, required: true, unique: true, index: true },
    denyTokenHash: { type: String, required: true, unique: true, index: true },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminApprovalRequest', adminApprovalRequestSchema);
