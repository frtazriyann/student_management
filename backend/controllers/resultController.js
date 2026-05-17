const Result = require('../models/Result');
const Exam = require('../models/Exam');
const { analyzePerformance } = require('../utils/analytics');

exports.getResults = async (req, res) => {
  try {
    const { student, exam, page = 1, limit = 20 } = req.query;
    const query = {};
    if (student) query.student = student;
    if (exam) query.exam = exam;
    const results = await Result.find(query)
      .populate('student', 'name email batch')
      .populate({ path: 'exam', populate: { path: 'subject', select: 'name code' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Result.countDocuments(query);
    res.json({ results, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const { student, exam: examId, marksObtained } = req.body;
    const exists = await Result.findOne({ student, exam: examId });
    if (exists) return res.status(400).json({ message: 'Result already exists for this student and exam' });
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const percentage = (marksObtained / exam.totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';
    const result = await Result.create({
      ...req.body,
      percentage: Math.round(percentage * 100) / 100,
      grade,
    });
    const populated = await result.populate([
      { path: 'student', select: 'name email batch' },
      { path: 'exam', populate: { path: 'subject', select: 'name code' } },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    if (req.body.marksObtained !== undefined) {
      const result = await Result.findById(req.params.id);
      if (!result) return res.status(404).json({ message: 'Result not found' });
      const exam = await Exam.findById(result.exam);
      const percentage = (req.body.marksObtained / exam.totalMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';
      req.body.percentage = Math.round(percentage * 100) / 100;
      req.body.grade = grade;
    }
    const updated = await Result.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'student', select: 'name email batch' },
      { path: 'exam', populate: { path: 'subject', select: 'name code' } },
    ]);
    if (!updated) return res.status(404).json({ message: 'Result not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user._id : req.params.studentId;
    const results = await Result.find({ student: studentId })
      .populate({ path: 'exam', populate: { path: 'subject', select: 'name code' } })
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user._id : req.params.studentId;
    const results = await Result.find({ student: studentId })
      .populate({ path: 'exam', populate: { path: 'subject', select: 'name code' } })
      .sort({ 'exam.date': 1 });
    const analytics = analyzePerformance(results);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
