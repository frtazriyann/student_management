const Document = require('../models/Document');

exports.getDocuments = async (req, res) => {
  try {
    const { type, student, subject, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (student) query.student = student;
    if (subject) query.subject = subject;
    const documents = await Document.find(query)
      .populate('student', 'name email')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Document.countDocuments(query);
    res.json({ documents, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const document = await Document.create({
      ...req.body,
      fileUrl: req.file.path || req.file.location || `/uploads/${req.file.filename}`,
      filePublicId: req.file.filename,
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [{ student: req.user._id }, { isPublic: true }],
    })
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
