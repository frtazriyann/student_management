const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: [0, 'Due amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'partial'],
      default: 'unpaid',
    },
    paidDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
