const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Assigned student is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'submitted', 'completed', 'overdue'],
      default: 'pending',
    },
    submission: {
      text: { type: String, trim: true },
      file: { type: String },
      submittedAt: { type: Date },
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);
