const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
      maxlength: [200, 'Exam name cannot exceed 200 characters'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    batch: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1'],
    },
    passingMarks: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

examSchema.index({ subject: 1 });
examSchema.index({ batch: 1 });
examSchema.index({ date: 1 });

module.exports = mongoose.model('Exam', examSchema);
