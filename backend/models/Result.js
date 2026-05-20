const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam reference is required'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    grade: {
      type: String,
      trim: true,
    },
    percentage: {
      type: Number,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, exam: 1 }, { unique: true });
resultSchema.index({ student: 1 });
resultSchema.index({ exam: 1 });

resultSchema.pre('save', function (next) {
  if (this.marksObtained != null && this.populated('exam')) {
    const totalMarks = this.exam.totalMarks;
    this.percentage = (this.marksObtained / totalMarks) * 100;
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
