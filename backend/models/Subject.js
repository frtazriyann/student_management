const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

subjectSchema.index({ name: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
