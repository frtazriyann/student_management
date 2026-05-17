const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema(
  {
    batch: {
      type: String,
      required: [true, 'Batch is required'],
      trim: true,
    },
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: [
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    room: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['regular', 'special', 'exam'],
      default: 'regular',
    },
    notice: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

routineSchema.index({ batch: 1, day: 1 });

module.exports = mongoose.model('Routine', routineSchema);
