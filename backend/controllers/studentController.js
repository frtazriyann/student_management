const Student = require('../models/Student');
const Subject = require('../models/Subject');
const generateToken = require('../utils/generateToken');

exports.getStudents = async (req, res) => {
  try {
    const { batch, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (batch) query.batch = batch;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const students = await Student.find(query)
      .populate('subjects', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Student.countDocuments(query);
    res.json({ students, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('subjects', 'name code');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { email, subjectNames } = req.body;
    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Student with this email already exists' });
    if (subjectNames && Array.isArray(subjectNames) && subjectNames.length > 0) {
      const subjectIds = [];
      for (const name of subjectNames) {
        const trimmed = name.trim();
        if (!trimmed) continue;
        let subject = await Subject.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
        if (!subject) {
          subject = await Subject.create({ name: trimmed });
        }
        subjectIds.push(subject._id);
      }
      req.body.subjects = subjectIds;
    }
    delete req.body.subjectNames;
    const student = await Student.create(req.body);
    const populated = await student.populate('subjects', 'name code');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (req.body.password) {
      student.password = req.body.password;
      delete req.body.password;
      await student.save();
    }
    if (req.body.subjectNames && Array.isArray(req.body.subjectNames)) {
      const subjectIds = [];
      for (const name of req.body.subjectNames) {
        const trimmed = name.trim();
        if (!trimmed) continue;
        let subj = await Subject.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
        if (!subj) {
          subj = await Subject.create({ name: trimmed });
        }
        subjectIds.push(subj._id);
      }
      req.body.subjects = subjectIds;
    }
    delete req.body.subjectNames;
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subjects', 'name code');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate('subjects', 'name code');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
