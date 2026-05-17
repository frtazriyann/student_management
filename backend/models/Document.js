const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['answer_sheet', 'notes', 'exam_paper', 'material', 'other'],
      required: [true, 'Document type is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    filePublicId: {
      type: String,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    uploadedBy: {
      type: String,
      enum: ['admin', 'student'],
      default: 'admin',
    },
    description: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

documentSchema.index({ student: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ subject: 1 });

module.exports = mongoose.model('Document', documentSchema);
