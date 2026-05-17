const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Subject = require('../models/Subject');

exports.getExams = async (req, res) => {
  try {
    const { subject, batch, page = 1, limit = 20 } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (batch) query.batch = batch;
    const exams = await Exam.find(query)
      .populate('subject', 'name code')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Exam.countDocuments(query);
    res.json({ exams, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    if (req.body.subjectName && !req.body.subject) {
      const trimmed = req.body.subjectName.trim();
      let subject = await Subject.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
      if (!subject) {
        subject = await Subject.create({ name: trimmed });
      }
      req.body.subject = subject._id;
    }
    delete req.body.subjectName;
    const exam = await Exam.create(req.body);
    const populated = await exam.populate('subject', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name code');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await Result.deleteMany({ exam: req.params.id });
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
